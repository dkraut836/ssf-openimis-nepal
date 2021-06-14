import React, { Component } from "react";
import { ProxyPage } from "@openimis/fe-core";


class CreatePage extends Component {
    render() {
        return <ProxyPage url="/Family.aspx" />
    }
}

export { CreatePage };