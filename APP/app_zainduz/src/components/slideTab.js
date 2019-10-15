import React from "react";
import Slide from "react-swipeable-views";

class SlideTab extends React.Component {
  render() {
    return (
      <Slide className="">
        <div className="bg-primary">
          slide n°1
        </div>
        <div className="bg-secondary">
          slide n°2
        </div>
      </Slide>
    );
  }
}

export default SlideTab;
