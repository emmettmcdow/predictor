import { ChangeEvent, useEffect, useState } from "react";
import {
  FeatureExtractionPipeline,
  pipeline,
  ProgressInfo,
  env,
  DataArray,
} from "@huggingface/transformers";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
// const supabaseUrl = "https://fabxmporizzqflnftavs.supabase.co";
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYnhtcG9yaXp6cWZsbmZ0YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNDQ5MTIsImV4cCI6MjAzNzgyMDkxMn0.UIEJiUNkLsW28tBHmG-RQDW-I5JNlJLt62CSk9D_qG8";
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const supabase = createClient(supabaseUrl, supabaseKey);

env.allowLocalModels = false;
env.useBrowserCache = false;

interface TweetProps {
  tweet: Tweet;
  idx: number;
}
const dateToInputValue = (date: Date) => {
  return date.toISOString().split("T")[0];
};
function getTimeAgo(date: Date): string {
  const timeDifference = Date.now() - date.valueOf();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let plural = "";
  if (seconds < 60) {
    if (seconds != 1) {
      plural = "s";
    }
    return `${seconds} second${plural} ago`;
  } else if (minutes < 60) {
    if (minutes != 1) {
      plural = "s";
    }
    return `${minutes} minute${plural} ago`;
  } else if (hours < 24) {
    if (hours != 1) {
      plural = "s";
    }
    return `${hours} hour${plural} ago`;
  } else if (days < 30) {
    if (days != 1) {
      plural = "s";
    }
    return `${days} day${plural} ago`;
  } else if (months < 12) {
    if (months != 1) {
      plural = "s";
    }
    return `${months} month${plural} ago`;
  } else {
    if (years != 1) {
      plural = "s";
    }
    return `${years} year${plural} ago`;
  }
}

const TweetDisplay: React.FC<TweetProps> = ({ tweet, idx }) => {
  return (
    <div
      key={idx}
      className="max-w-xl border rounded-lg p-4 bg-black text-left"
    >
      {/* Header */}
      <div className="flex items-center mb-2">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div className="flex ml-3 truncate space-x-1">
          <div className="font-bold">{tweet.name}</div>
          <div className="text-gray-500">@{tweet.username}</div>
        </div>
      </div>

      {/* Content */}
      <p className="mb-4">{tweet.full_text}</p>

      {/* Footer */}
      <div className="text-gray-500 text-sm">
        <span>{getTimeAgo(tweet.created_at)}</span>
        <span> - {tweet.score}</span>
      </div>
    </div>
  );
};

interface Tweet {
  name: string;
  username: string;
  avatar: string;
  full_text: string;
  created_at: Date;
  score: number;
}

interface Config {
  topic: string;
  start_date: Date;
  end_date: Date;
  replies: boolean;
}

interface Embedder {
  good: DataArray;
  bad: DataArray;
  pipe: FeatureExtractionPipeline;
  state: string;
}

const dotProduct = (vecA: DataArray, vecB: DataArray) => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  return vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
};

// Calculate magnitude (length) of a vector
const magnitude = (vec: DataArray) => {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
};

const cosineSimilarity = (vecA: DataArray, vecB: DataArray) => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  const dot = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  if (magA === 0 || magB === 0) {
    throw new Error("Cannot calculate cosine similarity for zero vector");
  }

  return dot / (magA * magB);
};

const getScore = async (text: string, embed: Embedder) => {
  let thisEmbed = (await embed.pipe(text, { pooling: "mean", normalize: true }))
    .data;
  const goodSim = cosineSimilarity(thisEmbed, embed.good);
  const badSim = cosineSimilarity(thisEmbed, embed.bad);

  const score = goodSim / (goodSim + badSim);
  console.log(`Score for ${text} is ${score}`);

  return score;
};

function App() {
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [calculated, setCalculated] = useState<string>("unstarted");
  const [embedder, setEmbedder] = useState<Embedder>({
    state: "uninitialized",
  });
  const [tweetState, setTweetState] = useState<string>("uninitialized");
  const [embedLoadProgress, setProgress] = useState("");
  const [config, setConfig] = useState<Config>({
    topic: "community",
    start_date: lastYear,
    end_date: today,
    replies: false,
  });

  const sampleSize = 2;

  const getTweets = (config: Config) => {
    setTweetState("running");
    if (config.replies) {
      supabase
        .schema("public")
        .from("tweets")
        .select(
          "full_text, created_at, accounts:account_id ( username, account_display_name )",
        )
        .like("full_text", `%${config.topic}%`)
        .filter("created_at", "gte", config.start_date.toISOString())
        .filter("created_at", "lte", config.end_date.toISOString())
        .limit(sampleSize)
        .then((data) => {
          // let newTweets: Tweet[] = tweets.slice();
          let newTweets: Tweet[] = [];
          data.data?.forEach((x, _) => {
            if (x.full_text.length > 280) {
              return;
            }
            newTweets.push({
              name: x.accounts.account_display_name,
              username: x.accounts.username,
              avatar: "",
              full_text: x.full_text,
              created_at: new Date(x.created_at),
            });
          });
          setTweetState("done");
          setTweets(newTweets);
        });
    } else {
      supabase
        .schema("public")
        .from("tweets")
        .select(
          "full_text, created_at, accounts:account_id ( username, account_display_name )",
        )
        .like("full_text", `%${config.topic}%`)
        // .filter("created_at", "gte", config.start_date.toISOString())
        // .filter("created_at", "lte", config.end_date.toISOString())
        .is("reply_to_username", null)
        .limit(sampleSize)
        .then((data) => {
          let newTweets: Tweet[] = [];
          data.data?.forEach((x, _) => {
            newTweets.push({
              name: x.accounts.account_display_name,
              username: x.accounts.username,
              avatar: "",
              full_text: x.full_text,
              created_at: new Date(x.created_at),
            });
          });
          setTweetState("done");
          setTweets(newTweets);
        });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTweetState("uninitialized");
    switch (e.target.id) {
      case "start_date":
      case "end_date":
        setConfig({ ...config, [e.target.id]: new Date(e.target.value) });
        break;
      case "replies":
        setConfig({ ...config, [e.target.id]: e.target.checked });
        break;
      default:
        setConfig({ ...config, [e.target.id]: e.target.value });
        break;
    }
  };

  const initEmbedder = async () => {
    const model_name = "nomic-ai/nomic-embed-text-v1.5";
    try {
      setEmbedder({ state: "loading" });
      const pipe = await pipeline("feature-extraction", model_name, {
        dtype: "q8",
        progress_callback: (data: ProgressInfo) => {
          if (data.status == "progress") {
            const { progress, total, loaded } = data;
            if (progress) {
              const totalMB = Math.round(total / (1024 * 1024));
              const loadedMB = Math.round(loaded / (1024 * 1024));

              setProgress(
                `${Math.round(progress)}% (${loadedMB}/${totalMB} mb)`,
              );
            }
          }
        },
      });
      let good = (await pipe("good", { pooling: "mean", normalize: true }))
        .data;
      let bad = (await pipe("bad", { pooling: "mean", normalize: true })).data;
      const state = "ready";
      setEmbedder({ pipe, good, bad, state });
    } catch (err) {
      throw new Error("Failed to initialize the embedding pipeline: " + err);
    }
  };

  const getScores = async (embedder: Embedder, tweets: Tweet[]) => {
    setCalculated("running");
    const newTweets = await Promise.all(
      tweets.map(async (tweet) => {
        return {
          ...tweet,
          score: await getScore(tweet.full_text, embedder),
        };
      }),
    );
    setCalculated("completed");
    setTweets(newTweets);
  };

  useEffect(() => {
    if (embedder.state == "uninitialized") initEmbedder();
    if (tweetState == "uninitialized") getTweets(config);
    if (
      embedder &&
      embedder.state == "ready" &&
      tweets.length != 0 &&
      calculated == "unstarted"
    ) {
      console.log("Can run embedder");
      getScores(embedder, tweets);
    }
  }, [config, embedder, tweets]);

  return (
    <div className="w-dvw h-full flex flex-col justify-between overflow-hidden">
      <div>This is the display</div>
      <div>{embedLoadProgress}</div>

      <div className="fixed w-1/3  right-0 top-0 bottom-20 p-4 border-l-1 rounded-lg flex flex-col space-y-2 justify-start bg-gray-900">
        <div key="fixed top-0">Tweets</div>
        <div className="overflow-auto">
          {tweets &&
            tweets.map((tweet: Tweet, i: number) => (
              <TweetDisplay tweet={tweet} idx={i} />
            ))}
        </div>
      </div>

      <div className="fixed w-dvw bottom-0 left-0 p-4 border-t-1 rounded-lg bg-gray-900 overflow-hidden">
        <form className="flex flex-row justify-start align-center space-x-4">
          <div className="flex flex-col">
            <input
              id="topic"
              className="bg-slate-700 rounded-lg"
              value={config.topic}
              onChange={handleChange}
            ></input>
            <label htmlFor="topic">Topic</label>
          </div>
          <div className="flex flex-row space-x-4">
            <div className="flex flex-col align-vernter">
              <input
                id="start_date"
                type="date"
                value={dateToInputValue(config.start_date)}
                onChange={handleChange}
              ></input>
              <label htmlFor="start">Start Date</label>
            </div>
            <div className="flex flex-col bg-g">
              <input
                id="end_date"
                type="date"
                value={dateToInputValue(config.end_date)}
                onChange={handleChange}
              ></input>
              <label htmlFor="end">End Date</label>
            </div>
            <div className="flex flex-col bg-g">
              <input
                id="replies"
                type="checkbox"
                className="mx-auto"
                checked={config.replies}
                onChange={handleChange}
              ></input>
              <label htmlFor="replies">Incl. Replies</label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
