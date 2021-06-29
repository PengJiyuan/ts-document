import { ReactNode, CSSProperties } from "react";

/**
 * Alert
 */
export interface AlertProps {
  style?: CSSProperties;
  className?: string | string[];
  /**
   * @zhCN 自定义操作项
   * @enUS this is action
   */
  action?: ReactNode;
  /**
   * @zhCN 是否可以关闭
   * @enUS Whether Alert can be closed
   */
  closable?: boolean;
  /**
   * @zhCN 关闭的回调
   * @enUS Callback when Alert is closed
   */
  onClose?: (e) => void;
  /**
   * @zhCN 关闭动画结束后执行的回调
   * @enUS Callback when Alert close animation completed
   */
  afterClose?: () => void;
  /**
   * @zhCN 警告的类型
   * @enUS Type of Alert
   */
  type?: "info" | "success" | "warning" | "error";
  /**
   * @zhCN 标题
   * @enUS Title of Alert
   */
  title?: string;
  /**
   * @zhCN 内容
   * @enUS Content of Alert
   */
  content: ReactNode;
  /**
   * @zhCN 可以指定自定义图标，`showIcon` 为 `true` 时生效。
   * @enUS Custom icon, effective when `showIcon` is `true`
   */
  icon?: ReactNode;
  /**
   * @zhCN 自定义关闭按钮
   * @enUS Custom close button Element
   */
  closeElement?: ReactNode;
  /**
   * @zhCN 是否显示图标
   * @enUS Whether to show icon
   */
  showIcon?: boolean;
  /**
   * @zhCN 是否用作顶部公告
   * @enUS Whether to show as banner
   */
  banner?: boolean;
  children?: ReactNode;
}

function Alert(props: AlertProps) {
  return <div>{props.children}</div>;
}

Alert.defaultProps = {
  showIcon: true,
  type: "info",
};

export default Alert;
