import "./App.css";

interface TweetProps {
  username: string;
  handle: string;
  content: string;
  timestamp: string;
}

const Tweet: React.FC<TweetProps> = ({
  username,
  handle,
  content,
  timestamp,
}) => {
  return (
    <div className="max-w-xl border rounded-lg p-4 bg-black text-left">
      {/* Header */}
      <div className="flex items-center mb-2">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div className="flex ml-3 truncate space-x-1">
          <div className="font-bold">{username}</div>
          <div className="text-gray-500">@{handle}</div>
        </div>
      </div>

      {/* Content */}
      <p className="mb-4">{content}</p>

      {/* Footer */}
      <div className="text-gray-500 text-sm">
        <span>{timestamp}</span>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="w-dvw h-dvh flex flex-col justify-between">
      <div>This is the display</div>

      <div className="absolute h-full w-1/3 top-0 right-0 p-4 border-l-1 rounded-lg flex flex-col space-y-2 justify-start">
        <div>Tweets</div>
        <Tweet
          handle="emcd0w"
          username="Emmett McDow"
          content="This is a test tweet, react normally"
          timestamp="2h ago"
        />
        <Tweet
          handle="emcd0w"
          username="Emmett McDow"
          content="This is a test tweet, react normally"
          timestamp="2h ago"
        />
        <Tweet
          handle="emcd0w"
          username="Emmett McDow"
          content="This is a test tweet, react normally"
          timestamp="2h ago"
        />
      </div>

      <div className="absolute w-dvw bottom-0 left-0 p-4 border-t-1 rounded-lg">
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
