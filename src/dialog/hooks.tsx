import { getCurrentInstance } from 'vue';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import { useTNodeJSX } from '../hooks/tnode';
import TButton, { ButtonProps } from '../button';
import { PopconfirmConfig, DialogConfig, DrawerConfig } from '../config-provider';
import { ClassName, TNode } from '../common';

export type MixinsFooterButton = string | ButtonProps | TNode;

export interface MixinsConfirmBtn {
  theme?: MixinsThemeType;
  className?: ClassName;
  confirmBtn: MixinsFooterButton;
  globalConfirm: PopconfirmConfig['confirm'] | DrawerConfig['confirm'] | DialogConfig['confirm'];
  globalConfirmBtnTheme?: PopconfirmConfig['confirmBtnTheme'] | DialogConfig['confirmBtnTheme'];
}

export interface MixinsCancelBtn {
  className?: ClassName;
  cancelBtn: MixinsFooterButton;
  globalCancel: PopconfirmConfig['cancel'] | DrawerConfig['cancel'] | DialogConfig['cancel'];
}

export type MixinsThemeType = keyof (PopconfirmConfig['confirmBtnTheme'] & DialogConfig['confirmBtnTheme']);

export interface BtnAction {
  confirmBtnAction: (e: MouseEvent) => void;
  cancelBtnAction: (e: MouseEvent) => void;
}

export function useAction(action: BtnAction) {
  const instance = getCurrentInstance();
  const renderTNodeJSX = useTNodeJSX();
  // 全局配置属性综合
  const getDefaultConfirmBtnProps = (options: MixinsConfirmBtn): ButtonProps => {
    const { globalConfirm, theme, globalConfirmBtnTheme } = options;
    const defaultTheme = globalConfirmBtnTheme?.[theme] || 'primary';
    let props: ButtonProps = {
      theme: defaultTheme,
      content: '确定',
      onClick: (e) => {
        action.confirmBtnAction(e);
      },
    };
    if (isString(globalConfirm)) {
      props.content = globalConfirm;
    } else if (isObject(globalConfirm)) {
      props = { ...props, ...globalConfirm };
    }
    return props;
  };
  // 全局配置属性综合
  const getDefaultCancelBtnProps = (options: MixinsCancelBtn): ButtonProps => {
    const { globalCancel } = options;
    let props: ButtonProps = {
      theme: 'default',
      content: '取消',
      onClick: (e) => {
        action.cancelBtnAction(e);
      },
    };
    if (isString(globalCancel)) {
      props.content = globalCancel;
    } else if (isObject(globalCancel)) {
      props = { ...props, ...globalCancel };
    }
    return props;
  };
  const getButtonByProps = (button: string | ButtonProps, defaultButton: ButtonProps, className?: ClassName) => {
    let newOptions = defaultButton;
    if (isString(button)) {
      newOptions.content = button;
    } else if (isObject(button)) {
      newOptions = { ...newOptions, ...button };
    }
    return <TButton class={className} {...newOptions} />;
  };
  const getConfirmBtn = (options: MixinsConfirmBtn) => {
    const { confirmBtn, className } = options;
    if (confirmBtn === null) return null;
    if (confirmBtn && instance.slots.confirmBtn) {
      console.warn('Both $props.confirmBtn and $scopedSlots.confirmBtn exist, $props.confirmBtn is preferred.');
    }
    const defaultButtonProps = getDefaultConfirmBtnProps(options);
    // 属性和插槽都不存在，就返回全局默认配置
    if (!confirmBtn && !instance.slots.confirmBtn) {
      return <TButton class={className} {...defaultButtonProps} />;
    }
    // 如果属性存在，优先返回属性配置
    if (confirmBtn && ['string', 'object'].includes(typeof confirmBtn)) {
      return getButtonByProps(confirmBtn as string | ButtonProps, defaultButtonProps, className);
    }
    // 渲染插槽 或 function 类型的 confirmBtn，属性优先级更高
    return renderTNodeJSX('confirmBtn');
  };
  const getCancelBtn = (options: MixinsCancelBtn) => {
    const { cancelBtn, className } = options;
    if (cancelBtn === null) return null;
    if (cancelBtn && instance.slots.cancelBtn) {
      console.warn('Both $props.cancelBtn and $scopedSlots.cancelBtn exist, $props.cancelBtn is preferred.');
    }
    const defaultButtonProps: ButtonProps = getDefaultCancelBtnProps(options);
    // 属性和插槽都不存在，就返回全局默认配置
    if (!cancelBtn && !instance.slots.cancelBtn) {
      return <TButton class={className} {...defaultButtonProps} />;
    }
    // 如果属性存在，优先返回属性配置
    if (cancelBtn && ['string', 'object'].includes(typeof cancelBtn)) {
      return getButtonByProps(cancelBtn as string | ButtonProps, defaultButtonProps);
    }
    // 渲染插槽 或 function 类型的 confirmBtn，属性优先级更高
    return renderTNodeJSX('cancelBtn');
  };
  return { getConfirmBtn, getCancelBtn };
}
