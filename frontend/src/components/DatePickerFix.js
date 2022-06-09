import React from 'react'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import { KeyboardDatePicker } from "@material-ui/pickers";

function DatePickerFix(props) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
        <KeyboardDatePicker
            className="birthday"
            error={props.error}
            autoOk
            variant="inline"
            inputVariant="outlined"
            label="Select Date"
            format="MM/DD/yyyy"
            minDate={new Date(Date.now()-100*365*24*60*60*1000)}
            maxDate={new Date(Date.now()-13*365*24*60*60*1000)}
            allowKeyboardControl
            value={props.value}
            onChange={props.onChange}
            openTo="year"
        />
    </MuiPickersUtilsProvider>
  )
}

export default DatePickerFix