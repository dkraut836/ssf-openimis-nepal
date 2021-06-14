import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { Keyboard, ScreenShare, Assignment } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
const DASHBOARD_MAIN_MENU_CONTRIBUTION_KEY = "claim.MainMenu";

class DashboardMainMenu extends Component {
  render() {
    const { rights } = this.props;
    let entries = [];
   
      entries.push({
        text: formatMessage(this.props.intl, "dashboard", "menu.reports"),
        icon: <Keyboard />,
        route: "/dashboard"
      });    
   
    if (!entries.length) return null;
    console.log('menuu',this.props )
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "dashboard", "menu.dashboard")}
        icon={<ScreenShare />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = state => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});
export default injectIntl(withModulesManager(connect(mapStateToProps)(DashboardMainMenu)));
