import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { withModulesManager, FormattedMessage, PublishedComponent } from "@openimis/fe-core";

const styles = theme => ({
    msg: {
        textAlign: "center",
        position: "relative",
        top: "50%"
    },
    title: theme.table.title,
    details: {
        padding: theme.spacing(1)
    }
})

class InsureeFirstServicePoint extends Component {
    render() {
        const { classes, insuree } = this.props;
        if (!insuree || !insuree.healthFacility) return (
            <div className={classes.msg}>
               
            </div>
        );
        return (
            <Grid container>
                <Grid item xs={12} className={classes.title}>
                    <FormattedMessage module="insuree" id="FSP.title" />
                </Grid>
                <Grid item xs={12} className={classes.details}>
                    <PublishedComponent
                        id="location.HealthFacilityFullPath"
                        hfid={insuree.healthFacility.id}
                    />
                </Grid>
            </Grid>
        );
    }
}


const mapStateToProps = state => ({
    insuree: state.insuree.insuree,
});

export default withModulesManager(withTheme(withStyles(styles)(connect(mapStateToProps)(InsureeFirstServicePoint))));