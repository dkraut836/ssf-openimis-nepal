import React, { Component } from "react";
import { ProxyPage } from "@openimis/fe-core";


class FamiliesPage extends Component {
    render() {
        return <ProxyPage url="/FindFamily.aspx" />
    }
}

export { FamiliesPage };