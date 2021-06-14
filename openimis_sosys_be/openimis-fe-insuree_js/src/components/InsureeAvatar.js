import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Avatar } from "@material-ui/core";

const styles = theme => ({
    bigAvatar: theme.bigAvatar
});

class InsureeAvatar extends Component {
    render() {
        const { classes, insuree } = this.props;
        return (
            <Avatar
                src={insuree && insuree.basePath && `${insuree.basePath}`}
                className={classes.bigAvatar}
            />
        )
    }
}

const mapStateToProps = state => ({
    insuree: state.insuree.insuree,
});

export default withTheme(
    withStyles(styles)(connect(mapStateToProps)(InsureeAvatar))
);
