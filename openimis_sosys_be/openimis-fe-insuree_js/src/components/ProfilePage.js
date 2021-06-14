import React, { Component } from "react";
import { ProxyPage } from "@openimis/fe-core";


class ProfilePage extends Component {
    render() {
        return <ProxyPage url={`/InsureeProfile.aspx${window.location.search}`} />
    }
}

export { ProfilePage }
