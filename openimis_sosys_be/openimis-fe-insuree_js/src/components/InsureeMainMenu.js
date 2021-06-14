import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { AssignmentInd, GroupAdd, People, PersonPin } from "@material-ui/icons";
import { formatMessage, MainMenuContribution } from "@openimis/fe-core";
import {
  RIGHT_FAMILY,
  RIGHT_ADD_FAMILY,
  RIGHT_INSUREE,
} from "../constants";

const INSUREE_MAIN_MENU_CONTRIBUTION_KEY = "insuree.MainMenu";

class InsureeMainMenu extends Component {
  render() {
    const { rights } = this.props;
    let entries = [];
    if (rights.includes(RIGHT_ADD_FAMILY)) {
      entries.push(
        {
          text: formatMessage(this.props.intl, "insuree", "menu.addFamilyOrGroup"),
          icon: <GroupAdd />,
          route: "/insuree/create",
          withDivider: true
        }
      )
    }
    if (rights.includes(RIGHT_FAMILY)) {
      entries.push(
        {
          text: formatMessage(this.props.intl, "insuree", "menu.familiesOrGroups"),
          icon: <People />,
          route: "/insuree/families"
        }
      )
    }
    if (rights.includes(RIGHT_INSUREE)) {
      entries.push(
        {
          text: formatMessage(this.props.intl, "insuree", "menu.insurees"),
          icon: <PersonPin />,
          route: "/insuree/insurees"
        }
      )
    }
    entries.push(...this.props.modulesManager.getContribs(INSUREE_MAIN_MENU_CONTRIBUTION_KEY).filter(c => !c.filter || c.filter(rights)));

    if (!entries.length) return null;
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "insuree", "mainMenu")}
        icon={<AssignmentInd />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = state => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(connect(mapStateToProps)(InsureeMainMenu));
