import { ChangeEvent, useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://fabxmporizzqflnftavs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYnhtcG9yaXp6cWZsbmZ0YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNDQ5MTIsImV4cCI6MjAzNzgyMDkxMn0.UIEJiUNkLsW28tBHmG-RQDW-I5JNlJLt62CSk9D_qG8";
const supabase = createClient(supabaseUrl, supabaseKey);

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
}

interface Config {
  topic: string;
  start_date: Date;
  end_date: Date;
  replies: boolean;
}

function App() {
  const today = new Date();
  const lastYear = new Date();
  lastYear.setMonth(lastYear.getMonth() - 1);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [config, setConfig] = useState<Config>({
    topic: "community",
    start_date: lastYear,
    end_date: today,
    replies: true,
  });

  const getTweets = (tweets: Tweet[], config: Config) => {
    supabase
      .rpc("search_tweets", {
        search_query: config.topic,
        since_date: config.start_date.toISOString(),
        until_date: config.end_date.toISOString(),
        limit_: 5,
      })
      .then((data) => {
        // let newTweets: Tweet[] = tweets.slice();
        let newTweets: Tweet[] = [];
        console.log(data.data);
        data.data?.forEach((x, _) => {
          newTweets.push({
            name: x.account.account_display_name,
            username: x.account.username,
            avatar: "",
            full_text: x.full_text,
            created_at: new Date(x.created_at),
          });
        });
        setTweets(newTweets);
      });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.id);
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

  useEffect(() => {
    console.log(config);
    getTweets(tweets, config);
  }, [config]);

  return (
    <div className="w-dvw h-full flex flex-col justify-between overflow-hidden">
      <div>This is the display</div>

      <div className="absolute h-full w-1/3 top-0 right-0 p-4 border-l-1 rounded-lg flex flex-col space-y-2 justify-start overflow-auto bg-gray-900">
        <div key="na">Tweets</div>
        {tweets &&
          tweets.map((tweet: Tweet, i: number) => (
            <TweetDisplay tweet={tweet} idx={i} />
          ))}
      </div>

      <div className="absolute w-dvw bottom-0 left-0 p-4 border-t-1 rounded-lg bg-gray-900 overflow-hidden">
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
