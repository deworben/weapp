import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import authAPI from '../authAPI';
import './LoginModal.less';

class LoginModal extends React.Component {
  static propTypes = {
    location: PropTypes.shape().isRequired,
    handleLoginModalCancel: PropTypes.func,
    visible: PropTypes.bool,
  };

  static defaultProps = {
    handleLoginModalCancel: () => {},
    visible: false,
  };

  constructor(props) {
    super(props);
    this.handleSignup = this.handleSignup.bind(this);
  }

  handleSignup() {
    window.open(process.env.SIGNUP_URL);
    this.props.handleLoginModalCancel();
  }

  render() {
    const { handleLoginModalCancel, visible, location } = this.props;
    const next = location.pathname.length > 1 ? location.pathname : '';
    return (
      <Modal
        title=""
        visible={visible}
        onCancel={handleLoginModalCancel}
        footer={
          <div className="LoginModal__footer">
            <FormattedMessage
              id="login_modal_footer_text"
              defaultMessage="Don't have an account? Signup with {link}"
              values={{
                link: (
                  <a role="presentation" onClick={this.handleSignup}>
                    alpha.Ezira.io
                  </a>
                ),
              }}
            />
          </div>
        }
      >
        <div className="LoginModal__body">
          <i className="iconfont icon-native-app LoginModal__icon" />
          <span className="LoginModal__login-title">
            <FormattedMessage id="login_to_native_app" defaultMessage="Login to Ezira" />
          </span>
          <span className="LoginModal__login-description">
            <FormattedMessage
              id="login_modal_description"
              defaultMessage="Login with your Ezira account using weAuth to enjoy Ezira at 100%"
            />
          </span>
          <a className="LoginModal__login-button" href={authAPI.getLoginURL(next)}>
            <FormattedMessage
              id="login_with_native_auth"
              defaultMessage="Login with weAuth"
            />
          </a>
        </div>
      </Modal>
    );
  }
}

export default withRouter(LoginModal);
