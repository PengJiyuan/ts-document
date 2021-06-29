import { ReactNode, CSSProperties } from "react";

/**
 * Alert
 */
export interface AlertProps {
  style?: CSSProperties;
  className?: string | string[];
  /**
   * @zh 自定义操作项
   * @en this is action
   * @version 2.15.0
   */
  action?: ReactNode;
  /**
   * @zh 是否可以关闭
   * @en Whether Alert can be closed
   * @defaultValue false
   */
  closable?: boolean;
  /**
   * @zh 关闭的回调
   * @en Callback when Alert is closed
   */
  onClose?: (e) => void;
  /**
   * @zh 关闭动画结束后执行的回调
   * @en Callback when Alert close animation completed
   */
  afterClose?: () => void;
  /**
   * @zh 警告的类型
   * @en Type of Alert
   */
  type?: "info" | "success" | "warning" | "error";
  /**
   * @zh 标题
   * @en Title of Alert
   */
  title?: string;
  /**
   * @zh 内容
   * @en Content of Alert
   */
  content: ReactNode;
  /**
   * @zh 可以指定自定义图标，`showIcon` 为 `true` 时生效。
   * @en Custom icon, effective when `showIcon` is `true`
   */
  icon?: ReactNode;
  /**
   * @zh 自定义关闭按钮
   * @en Custom close button Element
   */
  closeElement?: ReactNode;
  /**
   * @zh 是否显示图标
   * @en Whether to show icon
   */
  showIcon?: InnerProps;
  /**
   * @zh 是否用作顶部公告
   * @en Whether to show as banner
   */
  banner?: boolean;
  children?: ReactNode;
}

interface InnerProps {
  /**
   * @zh 位置
   * @en position
   */
  position?: string;
  /**
   * @zh 尺寸
   * @en Size
   */
  size?: string;
}

function Alert(props: AlertProps) {
  return <div>{props.children}</div>;
}

Alert.defaultProps = {
  showIcon: true,
  type: "info",
};

export default Alert;
