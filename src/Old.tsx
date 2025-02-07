function App() {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Polarized Words</h1>
      <form>
        <label>
          Topic
          <input></input>
        </label>
        <div className="hr-even">
          <div>
            <label>
              Start Date:
              <input type="date"></input>
            </label>
          </div>
          <div>
            <label>
              End Date:
              <input type="date"></input>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;
