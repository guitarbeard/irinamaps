import {
  default as React,
  Component,
  PropTypes,
  Children,
} from "react";

export default class Application extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  render() {
    return (
      <div style={{ height: `100%` }}>
        {React.cloneElement(Children.only(this.props.children))}
      </div>
    );
  }
}
