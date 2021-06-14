import React, { Component } from "react";
import { ProxyPage } from "@openimis/fe-core";


class InsureesPage extends Component {
    render() {
        return <ProxyPage url="/FindInsuree.aspx" />
    }
}

export { InsureesPage };