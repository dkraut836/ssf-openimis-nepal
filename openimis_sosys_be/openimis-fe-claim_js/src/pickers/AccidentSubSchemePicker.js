import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { ACCIDENTIAL_PLACE } from "../constants";
class AccidentSubSchemePicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="Accident Scheme"
        constants={ACCIDENTIAL_PLACE}
        {...this.props}
    />  
    }
}

export default AccidentSubSchemePicker;