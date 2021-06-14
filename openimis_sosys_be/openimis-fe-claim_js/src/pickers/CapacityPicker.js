import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { CAPACITY } from "../constants";
class CapacityPicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="Capacity"
        constants={CAPACITY}
        {...this.props}
    />  
    }
}

export default CapacityPicker;