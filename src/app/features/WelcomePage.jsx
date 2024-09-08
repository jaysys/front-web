import React from "react";

const WelcomePage = ({ msg = "j.ho " }) => {
  return (
    <div>
      <h2>Welcome to my {msg} playground!</h2>
    </div>
  );
};

export default WelcomePage;
