import React from "react";
import SwipeableViews from "react-swipeable-views";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TablaCuidadores from "./tablaCuidadores";
import TablaClientes from "./tablaClientes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMd, faUserFriends } from "@fortawesome/free-solid-svg-icons";

class SlideTab extends React.Component {
  state = {
    index: 0
  };

  handleChange = (event, value) => {
    this.setState({
      index: value
    });
  };

  handleChangeIndex = index => {
    this.setState({
      index
    });
  };

  render() {
    const { index } = this.state;

    return (
      <div>
        <Tabs value={index} fullWidth centered onChange={this.handleChange}>
          <Tab
            className="w-50"
            icon={<FontAwesomeIcon icon={faUserMd} />}
            label="Cuidadores"
          />
          <Tab
            className="w-50"
            icon={<FontAwesomeIcon icon={faUserFriends} />}
            label="Clientes"
          />
        </Tabs>
        <SwipeableViews index={index} onChangeIndex={this.handleChangeIndex}>
          <div>
            <TablaCuidadores />
          </div>
          <div>
            <TablaClientes />
          </div>
        </SwipeableViews>
      </div>
    );
  }
}

export default SlideTab;
