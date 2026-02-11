import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="loader-ring outer-ring"></div>
        <div className="loader-ring inner-ring"></div>
      </div>
    </div>
  );
};

export default Loader;
