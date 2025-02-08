import { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://fabxmporizzqflnftavs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYnhtcG9yaXp6cWZsbmZ0YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNDQ5MTIsImV4cCI6MjAzNzgyMDkxMn0.UIEJiUNkLsW28tBHmG-RQDW-I5JNlJLt62CSk9D_qG8";
const supabase = createClient(supabaseUrl, supabaseKey);

interface TweetProps {
  tweet: TweeT;
  idx: number;
}
// TODO
function getTimeAgo(date: Date): string {
  const timeDifference = Date.now() - date.valueOf();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days < 30) {
    return `${days} days ago`;
  } else if (months < 12) {
    return `${months} months ago`;
  } else {
    return `${years} years ago`;
  }
}

const Tweet: React.FC<TweetProps> = ({ tweet, idx }) => {
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
        <span>{tweet.created_at.toString()}</span>
      </div>
    </div>
  );
};

interface TweeT {
  name: string;
  username: string;
  avatar: string;
  full_text: string;
  created_at: Date;
}

function App() {
  const [tweets, setTweets] = useState<TweeT[]>([]);

  useEffect(() => {
    supabase
      .schema("public")
      .from("tweets")
      .select(
        "full_text, created_at, account_id, account:account_id ( account_display_name, username )",
      )
      .limit(5)
      .then((data) => {
        let newTweets: TweeT[] = tweets.slice();
        data.data?.forEach((x, _) => {
          newTweets.push({
            name: x.account.account_display_name,
            username: x.account.username,
            avatar: "",
            full_text: x.full_text,
            created_at: x.created_at,
          });
        });
        setTweets(newTweets);
      });
  }, []);

  return (
    <div className="w-dvw h-full flex flex-col justify-between overflow-hidden">
      <div>This is the display</div>

      <div className="absolute h-full w-1/3 top-0 right-0 p-4 border-l-1 rounded-lg flex flex-col space-y-2 justify-start overflow-auto bg-gray-900">
        <div key="na">Tweets</div>
        {tweets &&
          tweets.map((tweet: TweeT, i: number) => (
            <Tweet tweet={tweet} idx={i} />
          ))}
      </div>

      <div className="absolute w-dvw bottom-0 left-0 p-4 border-t-1 rounded-lg bg-gray-900 overflow-hidden">
        <form className="flex flex-row justify-start align-center space-x-4">
          <div className="flex flex-col">
            <input id="topic" className="bg-slate-700 rounded-lg"></input>
            <label htmlFor="topic">Topic</label>
          </div>
          <div className="flex flex-row space-x-4">
            <div className="flex flex-col align-vernter">
              <input id="start" type="date"></input>
              <label htmlFor="start">Start Date</label>
            </div>
            <div className="flex flex-col bg-g">
              <input id="end" type="date"></input>
              <label htmlFor="end">End Date</label>
            </div>
          </div>
          <button>Get</button>
        </form>
      </div>
    </div>
  );
}

export default App;
