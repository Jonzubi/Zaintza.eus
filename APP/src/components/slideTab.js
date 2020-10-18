import React from "react";
import SwipeableViews from "react-swipeable-views";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TablaCuidadores from "../screens/TablaCuidadoresScreen/tablaCuidadores";
import TablaAnuncios from "../screens/TablaAnunciosScreen/tablaAnuncios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMd, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import {trans} from "../util/funciones";
import { colors } from '../util/colors';

class SlideTab extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      index: 0
    }
  }

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
        <Tabs value={index} centered onChange={this.handleChange} TabIndicatorProps={{
          style: {
            backgroundColor: colors.green
          }
        }}>
          <Tab
            style={{ outline: "none" }}
            className="w-50"
            icon={<FontAwesomeIcon icon={faUserMd} />}
            label={trans('slideTab.cuidadores')}

          />
          <Tab
            style={{ outline: "none" }}
            className="w-50"
            icon={<FontAwesomeIcon icon={faUserFriends} />}
            label={trans('slideTab.ofertas')}
          />
        </Tabs>
        <SwipeableViews key="Swipe" index={index} onChangeIndex={this.handleChangeIndex}>
          <div key="tablaCuidadores">
            <TablaCuidadores />
          </div>
          <div key="tablaAnuncios">
            <TablaAnuncios />
          </div>
        </SwipeableViews>
      </div>
    );
  }
}

export default SlideTab;
