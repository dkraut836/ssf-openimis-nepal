import React, { Component } from "react";
import { ProxyPage } from "@openimis/fe-core";
import TestChart from "./TestChart";

class HomePage extends Component {
    render() {
        console.log('hitttttttt')
        return (
            <>
        {/* <ProxyPage url="/dashboard" /> */}
        <TestChart />
        </>
        )
    }
}

export { HomePage };