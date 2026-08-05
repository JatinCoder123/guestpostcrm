import CheckboxField from "./CheckBoxField";
import CurrencyField from "./CurrencyField";
import DateField from "./DateField";
import EmailField from "./EmailField";
import SelectField from "./SelectField";
import TextField from "./TextField";
import PhoneField from "./PhoneField";
import NumberField from "./NumberField";


const FIELD_COMPONENTS = {

    text: TextField,

    number: NumberField,

    currency: CurrencyField,

    date: DateField,

    select: SelectField,

    // badge: BadgeField,

    checkbox: CheckboxField,

    // actions: ActionField,

    email: EmailField,

    phone: PhoneField,

};

export default FIELD_COMPONENTS;