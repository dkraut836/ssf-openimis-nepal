import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { PAY_TO } from "../constants";
class PayToPicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="Pay To"
        constants={PAY_TO}
        {...this.props}
    />  
    }
}

export default PayToPicker;