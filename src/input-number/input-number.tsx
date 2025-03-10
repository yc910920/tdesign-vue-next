import { defineComponent, VNode } from 'vue';
import { AddIcon, RemoveIcon, ChevronDownIcon, ChevronUpIcon } from 'tdesign-icons-vue-next';
import { prefix } from '../config';
import TButton from '../button';
import CLASSNAMES from '../utils/classnames';
import props from './props';
import { ChangeSource } from './type';
import { ClassName } from '../common';
import { emitEvent } from '../utils/event';

// hooks
import { useFormDisabled } from '../form/hooks';

const name = `${prefix}-input-number`;

type InputNumberEvent = {
  onInput?: (e: InputEvent) => void;
  onClick?: (e: MouseEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onKeyup?: (e: KeyboardEvent) => void;
  onKeypress?: (e: KeyboardEvent) => void;
};

type ChangeContextEvent = InputEvent | MouseEvent | FocusEvent;

type InputNumberAttr = {
  disabled?: boolean;
  readonly?: any;
  autocomplete?: string;
  ref: string;
  placeholder: string;
};

export default defineComponent({
  name: 'TInputNumber',
  components: {
    AddIcon,
    RemoveIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TButton,
  },
  props: { ...props },
  emits: ['update:value', 'change', 'blur', 'focus', 'keydown-enter', 'keydown', 'keyup', 'keypress'],
  setup(props) {
    const disabled = useFormDisabled();
    return {
      disabled,
    };
  },
  data() {
    return {
      userInput: null,
      filterValue: null,
      isError: false,
      inputing: false,
    };
  },
  computed: {
    disabledReduce(): boolean {
      return this.disabled || this.isError || Number(this.value) - this.step < this.min;
    },
    disabledAdd(): boolean {
      return this.disabled || this.isError || Number(this.value) + this.step > this.max;
    },
    valueDecimalPlaces(): number {
      const tempVal =
        this.filterValue !== null &&
        !Number.isNaN(Number(this.filterValue)) &&
        !Number.isNaN(parseFloat(this.filterValue))
          ? this.filterValue
          : String(this.value);
      const tempIndex = tempVal.indexOf('.') + 1;
      return tempIndex > 0 ? tempVal.length - tempIndex : 0;
    },
    stepDecimalPlaces(): number {
      const tempVal = String(this.step);
      const tempIndex = tempVal.indexOf('.') + 1;
      return tempIndex > 0 ? tempVal.length - tempIndex : 0;
    },
    digitsNum(): number {
      if (this.decimalPlaces !== undefined) {
        if (this.decimalPlaces < this.stepDecimalPlaces) {
          console.warn('decimal places of step should be less than decimal-places');
        }
        return this.decimalPlaces;
      }
      return this.valueDecimalPlaces > this.stepDecimalPlaces ? this.valueDecimalPlaces : this.stepDecimalPlaces;
    },
    reduceClasses() {
      return [
        `${name}__decrease`,
        {
          [CLASSNAMES.STATUS.disabled]: this.disabledReduce,
        },
      ];
    },
    reduceEvents(): InputNumberEvent {
      return {
        onClick: this.handleReduce,
      };
    },
    addClasses(): ClassName {
      return [
        `${name}__increase`,
        {
          [CLASSNAMES.STATUS.disabled]: this.disabledAdd,
        },
      ];
    },
    addEvents(): InputNumberEvent {
      return {
        onClick: this.handleAdd,
      };
    },
    cmptWrapClasses(): ClassName {
      return [
        't-input-number',
        CLASSNAMES.SIZE[this.size],
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled,
          't-is-controls-right': this.theme === 'column',
          't-input-number--normal': this.theme === 'normal',
        },
      ];
    },
    inputWrapProps(): ClassName {
      return [
        't-input',
        {
          't-is-error': this.isError,
          [`${prefix}-align-${this.align}`]: this.align,
        },
      ];
    },
    inputClasses(): ClassName {
      return [
        't-input__inner',
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled,
          [`${name}-text-align`]: this.theme === 'row',
        },
      ];
    },
    inputEvents(): InputNumberEvent {
      return {
        onInput: this.handleInput,
        onBlur: this.handleBlur,
        onFocus: this.handleFocus,
        onKeydown: this.handleKeydown,
        onKeyup: this.handleKeyup,
        onKeypress: this.handleKeypress,
      };
    },
    inputAttrs(): InputNumberAttr {
      return {
        disabled: this.disabled,
        autocomplete: 'off',
        ref: 'refInputElem',
        placeholder: this.placeholder,
      };
    },
    decreaseIcon(): VNode {
      return this.theme === 'column' ? <chevron-down-icon size={this.size} /> : <remove-icon size={this.size} />;
    },
    increaseIcon(): VNode {
      return this.theme === 'column' ? <chevron-up-icon size={this.size} /> : <add-icon size={this.size} />;
    },
    displayValue(): number | string {
      // inputing
      if (this.inputing && this.userInput !== null) {
        return this.filterValue;
      }
      if ([undefined, null].includes(this.value)) return '';
      // end input
      return this.format && !this.inputing ? this.format(this.value) : this.value.toFixed(this.digitsNum);
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        if (v !== undefined) {
          this.isValidNumber(v);
        }
      },
    },
  },
  methods: {
    handleAdd(e: MouseEvent) {
      if (this.disabledAdd) return;
      const value = this.value || 0;
      const factor = 10 ** this.digitsNum;
      this.handleAction(
        Number(this.toDecimalPlaces((value * factor + this.step * factor) / factor).toFixed(this.digitsNum)),
        'add',
        e,
      );
    },
    handleReduce(e: MouseEvent) {
      if (this.disabledReduce) return;
      const value = this.value || 0;
      const factor = 10 ** this.digitsNum;
      this.handleAction(
        Number(this.toDecimalPlaces((value * factor - this.step * factor) / factor).toFixed(this.digitsNum)),
        'reduce',
        e,
      );
    },
    handleInput(e: InputEvent) {
      // get
      this.userInput = (e.target as HTMLInputElement).value;
      // filter
      this.filterValue = this.toValidStringNumber(this.userInput);
      this.userInput = '';
      // check
      if (!this.isValid(this.filterValue) || Number(this.filterValue) === this.value) return;
      // set
      this.updateValue(Number(this.filterValue));
      this.handleAction(Number(this.filterValue), 'input', e);
    },
    handleAction(value: number, actionType: ChangeSource, e: ChangeContextEvent) {
      if (actionType !== 'input') {
        this.clearInput();
      }
      this.handleChange(value, { type: actionType, e });
    },
    toValidStringNumber(s: string) {
      // only allow one [.e] and two [-]
      let filterVal = s.replace(/[^\d.eE。-]/g, '').replace('。', '.');
      if (this.multiE(filterVal) || this.multiDot(filterVal) || this.multiNegative(filterVal)) {
        filterVal = filterVal.substring(0, filterVal.length - 1);
      }
      return filterVal;
    },
    toValidNumber(s: string) {
      const val = Number(s);
      if (Number.isNaN(val) || Number.isNaN(parseFloat(s))) return this.value;
      if (val > this.max) return this.max;
      if (val < this.min) return this.min;
      return parseFloat(s);
    },
    handleChange(value: number, ctx: { type: ChangeSource; e: ChangeContextEvent }) {
      this.updateValue(value);
      emitEvent(this, 'change', value, { type: ctx.type, e: ctx.e });
    },
    async handleBlur(e: FocusEvent) {
      await this.handleEndInput(e);
      this.clearFilterValue();
      emitEvent(this, 'blur', this.value, { e });
    },
    handleFocus(e: FocusEvent) {
      this.handleStartInput();
      emitEvent(this, 'focus', this.value, { e });
    },
    handleKeydownEnter(e: KeyboardEvent) {
      if (e.key !== 'Enter') return;
      emitEvent(this, 'keydown-enter', this.value, { e });
    },
    handleKeydown(e: KeyboardEvent) {
      emitEvent(this, 'keydown', this.value, { e });
      this.handleKeydownEnter(e);
    },
    handleKeyup(e: KeyboardEvent) {
      emitEvent(this, 'keyup', this.value, { e });
    },
    handleKeypress(e: KeyboardEvent) {
      emitEvent(this, 'keypress', this.value, { e });
    },
    handleStartInput() {
      this.inputing = true;
      if (this.value === undefined) return;
      this.filterValue = this.value.toFixed(this.digitsNum);
    },
    handleEndInput(e: FocusEvent) {
      this.inputing = false;
      const value = this.toValidNumber(this.filterValue);
      if (value !== this.value) {
        this.updateValue(value);
        this.handleAction(value, 'input', e);
      }
      this.isError = false;
    },
    updateValue(v: number) {
      this.$emit('update:value', v);
    },
    handleInputError(visible: boolean) {
      this.isError = visible;
    },
    isValid(v: string) {
      const numV = Number(v);
      if (this.empty(v) || Number.isNaN(numV)) {
        this.handleInputError(true);
        return false;
      }
      return this.isValidNumber(numV);
    },
    isValidNumber(v: number) {
      if (v > this.max) {
        this.handleInputError(true);
        return false;
      }
      if (v < this.min) {
        this.handleInputError(true);
        return false;
      }
      this.handleInputError(false);
      return true;
    },
    empty(v: string) {
      return !v && !v.replace(' ', '');
    },
    clearInput() {
      this.userInput = null;
    },
    clearFilterValue() {
      this.filterValue = '';
    },
    multiE(s: string) {
      const m = s.match(/[e]/gi);
      return m === null ? false : m.length > 1;
    },
    multiDot(s: string) {
      const m = s.match(/[.]/g);
      return m === null ? false : m.length > 1;
    },
    multiNegative(s: string) {
      const m = s.match(/[-]/g);
      return m === null ? false : m.length > 2;
    },
    toDecimalPlaces(value: number): number {
      const decimalPlaces = this.decimalPlaces === undefined ? this.digitsNum : this.decimalPlaces;
      const factor = 10 ** decimalPlaces;
      return Math.round(value * factor) / factor;
    },
  },
  render() {
    return (
      <div class={this.cmptWrapClasses}>
        {this.theme !== 'normal' && (
          <t-button
            class={this.reduceClasses}
            {...this.reduceEvents}
            variant="outline"
            shape="square"
            v-slots={{
              icon: () => this.decreaseIcon,
            }}
          />
        )}
        <div class={this.inputWrapProps}>
          <input value={this.displayValue} class={this.inputClasses} {...this.inputAttrs} {...this.inputEvents} />
        </div>
        {this.theme !== 'normal' && (
          <t-button
            class={this.addClasses}
            {...this.addEvents}
            variant="outline"
            shape="square"
            v-slots={{
              icon: () => this.increaseIcon,
            }}
          />
        )}
      </div>
    );
  },
});
