import {
  Calendar,
  Checkbox,
  CheckboxCard,
  Combobox,
  Editable,
  Field,
  FileUpload,
  Input,
  MultiSelect,
  NativeSelect,
  NumberInput,
  PinInput,
  Radio,
  RadioCard,
  Rating,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Textarea,
} from "astralis-ui";
import { calendarProps } from "../calendar/calendar-props";
import { checkboxProps } from "../checkbox/checkbox-props";
import { checkboxCardProps } from "../checkbox-card/checkbox-card-props";
import { comboboxProps } from "../combobox/combobox-props";
import { editableProps } from "../editable/editable-props";
import { fieldProps } from "../field/field-props";
import { fileUploadProps } from "../file-upload/file-upload-props";
import { inputProps } from "../input/input-props";
import { multiSelectProps } from "../multi-select/multi-select-props";
import { nativeSelectProps } from "../native-select/native-select-props";
import { numberInputProps } from "../number-input/number-input-props";
import { pinInputProps } from "../pin-input/pin-input-props";
import { radioProps } from "../radio/radio-props";
import { radioCardProps } from "../radio-card/radio-card-props";
import { ratingProps } from "../rating/rating-props";
import { segmentedControlProps } from "../segmented-control/segmented-control-props";
import { selectProps } from "../select/select-props";
import { sliderProps } from "../slider/slider-props";
import { switchProps } from "../switch/switch-props";
import { textareaProps } from "../textarea/textarea-props";
import { asEntry, definePlaygrounds } from "./define";

export const dataEntryPlaygrounds = definePlaygrounds({
  "switch-demo": {
    tag: "Switch",
    component: asEntry(Switch),
    rows: switchProps,
    children: "Enable notifications",
    childrenLabel: "Label",
  },
  "checkbox-demo": {
    tag: "Checkbox",
    component: asEntry(Checkbox),
    rows: checkboxProps,
    children: "Accept terms",
    childrenLabel: "Label",
  },
  "radio-demo": {
    tag: "Radio",
    component: asEntry(Radio),
    rows: radioProps,
    children: "Standard shipping",
    childrenLabel: "Label",
  },
  "input-demo": { tag: "Input", component: asEntry(Input), rows: inputProps },
  "textarea-demo": { tag: "Textarea", component: asEntry(Textarea), rows: textareaProps },

  /* `options` is configuration, not children, and not worth a control: the
     point is the surrounding props. Codegen serializes it to a JS literal so
     the snippet still runs. */
  "select-demo": {
    tag: "Select",
    component: asEntry(Select),
    rows: selectProps,
    baseProps: {
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
    },
  },
  "combobox-demo": {
    tag: "Combobox",
    component: asEntry(Combobox),
    rows: comboboxProps,
    baseProps: {
      options: [
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "svelte", label: "Svelte" },
      ],
    },
  },
  "multi-select-demo": {
    tag: "MultiSelect",
    component: asEntry(MultiSelect),
    rows: multiSelectProps,
    baseProps: {
      options: [
        { value: "design", label: "Design" },
        { value: "eng", label: "Engineering" },
        { value: "ops", label: "Operations" },
      ],
    },
  },
  "slider-demo": {
    tag: "Slider",
    component: asEntry(Slider),
    rows: sliderProps,
    baseProps: { defaultValue: 40 },
  },
  "number-input-demo": {
    tag: "NumberInput",
    component: asEntry(NumberInput),
    rows: numberInputProps,
    baseProps: { defaultValue: 3 },
  },
  "pin-input-demo": { tag: "PinInput", component: asEntry(PinInput), rows: pinInputProps },
  "calendar-demo": { tag: "Calendar", component: asEntry(Calendar), rows: calendarProps },
  "field-demo": {
    tag: "Field",
    component: asEntry(Field),
    rows: fieldProps,
    fixture: (
      <>
        <Field.Label>Email address</Field.Label>
        <Input type="email" placeholder="you@example.com" />
        <Field.HelpText>We&rsquo;ll never share your email.</Field.HelpText>
      </>
    ),
  },
  "checkbox-card-demo": {
    tag: "CheckboxCard",
    component: asEntry(CheckboxCard),
    rows: checkboxCardProps,
    baseProps: { description: "Traffic and conversion reports", defaultChecked: true },
    children: "Analytics",
    childrenLabel: "Title",
  },
  "radio-card-demo": {
    tag: "RadioCard",
    component: asEntry(RadioCard),
    rows: radioCardProps,
    baseProps: { description: "For growing teams", defaultChecked: true },
    children: "Pro",
    childrenLabel: "Title",
  },
  "rating-demo": {
    tag: "Rating",
    component: asEntry(Rating),
    rows: ratingProps,
    baseProps: { defaultValue: 3 },
  },
  "segmented-control-demo": {
    tag: "SegmentedControl",
    component: asEntry(SegmentedControl),
    rows: segmentedControlProps,
    baseProps: { defaultValue: "week" },
    fixture: (
      <>
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
        <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
      </>
    ),
  },
  "native-select-demo": {
    tag: "NativeSelect",
    component: asEntry(NativeSelect),
    rows: nativeSelectProps,
    baseProps: { "aria-label": "Region" },
    fixture: (
      <>
        <option value="eu">Europe</option>
        <option value="us">United States</option>
        <option value="apac">Asia Pacific</option>
      </>
    ),
  },
  "editable-demo": {
    tag: "Editable",
    component: asEntry(Editable),
    rows: editableProps,
    baseProps: { defaultValue: "Q3 launch plan" },
    fixture: (
      <>
        <Editable.Preview />
        <Editable.Input aria-label="Document title" />
      </>
    ),
  },
  "file-upload-demo": {
    tag: "FileUpload",
    component: asEntry(FileUpload),
    rows: fileUploadProps,
    fixture: (
      <>
        <FileUpload.Dropzone />
        <FileUpload.ItemGroup />
      </>
    ),
  },
});
