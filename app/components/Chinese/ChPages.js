import React from 'react';

import Appbar from 'muicss/lib/react/appbar';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Divider from 'muicss/lib/react/divider';
import styles from '../../styles.css';
import LandingCH from './LandingCH';
import Container from 'muicss/lib/react/container';
import footerLogo from '../../images/logo-w.png';

export default class ChPages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      nav: 'intel'
    };
  }

  handleHamburgerClick = () => {
    this.setState({
      showMenu: !this.state.showMenu
    });
  }

  handleNav = (page) => {
    this.setState({ nav: page });
  }

  render() {
  	const { children } = this.props;
    return (
      <div>
        <Appbar className={styles.bar}>
          <div className={styles.headerContainer}>
            <Row>
              <Col md="2">
                <img src="https://avatars1.githubusercontent.com/u/23401959?v=3&s=200" className={styles.appBarLogo}/>
                <span 
                  className={styles.hamburger}
                  onClick={this.handleHamburgerClick}
                >
                  ☰
                </span>
              </Col>
              <Col md="7" className={styles.appBarNav}>
                <div className={this.state.nav === 'intel' ? styles.navLinkSelected : styles.navLink} onClick={() => this.handleNav('intel')}>新聞情蒐</div>
                <div className={this.state.nav === 'keyword' ? styles.navLinkSelected : styles.navLink} onClick={() => this.handleNav('keyword')}>編輯關鍵字</div>
              </Col>
            </Row>
          </div>
        </Appbar>
        {
          this.state.showMenu &&
          <ul className={styles.dropDownUl}>
            <li className={styles.headerItemResponsive}>
              <div className={styles.navLink} onClick={() => this.handleNav('intel')}>新聞情蒐</div>
              <div className={styles.navLink} onClick={() => this.handleNav('keyword')}>編輯關鍵字</div>
            </li>
          </ul>
        }
       	{ React.cloneElement(children, { nav: this.state.nav }) }
        <Appbar className={styles.footer}>
                       <Container>
                        <Row>
                          <Col md="12">
                            <img src={footerLogo} height="20px" className={styles.footerLogo}/>
                          </Col>
                        </Row>
                      </Container>
                    </Appbar>
      </div>
    );
  }
}