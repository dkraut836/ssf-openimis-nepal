import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { INSUREE_GENDERS } from "../constants";

class InsureeGenderPicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="insuree"
            label="gender"
            constants={INSUREE_GENDERS}
            {...this.props}
        />
    }
}

export default InsureeGenderPicker;