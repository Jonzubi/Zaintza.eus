import React from "react";
import SwipeableViews from "react-swipeable-views";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TablaCuidadores from "./tablaCuidadores";
import TablaClientes from "./tablaClientes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMd, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import {t} from "../util/funciones";

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
        <Tabs value={index} centered onChange={this.handleChange}>
          <Tab
            style={{ outline: "none" }}
            className="w-50"
            icon={<FontAwesomeIcon icon={faUserMd} />}
            label={t('slideTab.cuidadores')}
          />
          <Tab
            style={{ outline: "none" }}
            className="w-50"
            icon={<FontAwesomeIcon icon={faUserFriends} />}
            label={t('slideTab.ofertas')}
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
