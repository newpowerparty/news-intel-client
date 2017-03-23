import React from 'react';

import Button from 'muicss/lib/react/button';
import Input from 'muicss/lib/react/input';
import Select from 'muicss/lib/react/select';
import Option from 'muicss/lib/react/option';
import Panel from 'muicss/lib/react/panel';
import Container from 'muicss/lib/react/container';
import Divider from 'muicss/lib/react/divider';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import _ from 'lodash';
import styles from '../../styles.css';
import uuid from 'uuid/v1';
import axios from 'axios';
import moment from 'moment-timezone';
moment.locale('zh-tw');

const AWSDBAPIGateway = '';
const keywordDBTableName = '';
const keywordDBURL = ``;
const newsTableName = '';
const newsDBURL = ``;

export default class LandingCH extends React.Component {
  constructor(prop, context) {
    super(prop, context);
    this.state = {
      uuid: uuid(),
      keyword: '',
      category: '熱門議題',
      keywordList: [],
      fullKeywordList: [],
      newsList: [],
      hoveredKeyword: null,
      keywordGroup: 'all',
      singleKeyword: ''
    };

    this.fileObjectUrl = '';
  }

  componentDidMount() {

    this.requestNewsFromDB(null, 4);

    axios.get(keywordDBURL)
      .then(response => {
        this.setState({
          keywordList: response.data.Items,
          fullKeywordList: response.data.Items
        })
      });

  }

  requestNewsFromDB = (lastKey, numOfReq) => {
    if (numOfReq > 0) {
      const requestUrl =
        lastKey ?
        `${newsDBURL}&ExclusiveStartKey=${encodeURI(JSON.stringify(lastKey))}`
        :
        newsDBURL;

      axios.get(requestUrl)
      .then(response => {
        const newsFeedList = response.data.Items.map(item => item.feed);
        const flatNewsList = _.flatten(newsFeedList);
        const mergedNewsList = [...this.state.newsList, ...flatNewsList];
        const uniqueMergedList = _.uniqWith(mergedNewsList, (v1, v2) => (v1.whenLastUpdate === v2.whenLastUpdate) && (v1.feedTitle === v2.feedTitle));
        this.setState({
          newsList: uniqueMergedList
        });
        numOfReq -= 1;
        if (response.data.LastEvaluatedKey) {
          this.requestNewsFromDB(response.data.LastEvaluatedKey, numOfReq);
        }
      })
      .catch(err => console.log(err));
    }
  }

  _onChangeKeyword = (event) => {
    this.setState({keyword: event.target.value});
  }

  _onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this._onSave();
    }
  }

  _onKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.setState({ keyword: '' });
    }
  }

  _handleDeleteAlert = (el) => {
    const cfm = confirm(`你確定要刪除關鍵字: ${el.keyword}?`);
    if (cfm === true) {
      this._handleDelete(el);
    } else {
      console.log('declined')
    }
  }

  _handleDelete = (el) => {
    axios({
      method: 'delete',
      url: AWSDBAPIGateway,
      data: {
        "Key": {
          uuid: el.uuid,
          keyword: el.keyword
        },
        "TableName": "NPPKeywords"
      }
    })
    .then((response) => {
      if (response.status === 200) {
        this.setState(
          {
            uuid: uuid(),
            keywordList: [...this.state.keywordList.filter((e, i) => e.uuid !== el.uuid)],
            fullKeywordList: [...this.state.fullKeywordList.filter((e, i) => e.uuid !== el.uuid)]
          });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  _onSave = () => {
    const repeated = _.find(this.state.fullKeywordList, { keyword: this.state.keyword});
    if (!!repeated) {
      alert('此關鍵字已經有囉');
    } else {
      if (this.state.keyword) {
        axios.post('https://5bq2v7mgi5.execute-api.us-east-1.amazonaws.com/prod/mySimpleBE', {
          "Item": {
            uuid: this.state.uuid,
            keyword: this.state.keyword,
            category: this.state.category
          },
          "TableName": keywordDBTableName
        })
        .then((response) => {
          if (response.status === 200) {
            this.setState(
              {
                keyword: '',
                uuid: uuid(),
                keywordList: [...this.state.keywordList, { uuid: this.state.uuid, keyword: this.state.keyword, category: this.state.category }],
                fullKeywordList: [...this.state.fullKeywordList, { uuid: this.state.uuid, keyword: this.state.keyword, category: this.state.category }] });
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      } else {
        alert('請輸入關鍵字')
      }
    }
  }

  handleSelect = (value) => {
    this.setState({ category: value });
  }

  setHoveredKeyword = (keyword) => {
    this.setState({ hoveredKeyword: keyword});
  }

  _hasKeywords = (string, keywords) => {
    var wordMap = keywords.map(el => string.includes(el.keyword) ? 1 : 0);
    var index = wordMap.length > 0 ? wordMap.reduce((a, b) => a + b) : 0;
    return index > 0;
  }

  setSubKeyword = (subkey) => {
    if (subkey === 'all') {
      this.setState({ keywordList: this.state.fullKeywordList });
    } else {
      this.setState({ keywordList: this.state.fullKeywordList.filter(el => el.category === subkey)});
    }
    this.setState({ keywordGroup: subkey, singleKeyword: '' });
  }

  setSingleKeyword = (keyword) => {
    this.setState(
      {
        keywordList: this.state.fullKeywordList.filter(el => el.keyword === keyword),
        singleKeyword: keyword,
        keywordGroup: ''
      });
  }

  render() {
    const {
      keywordList,
      fullKeywordList,
      newsList,
      hoveredKeyword,
      keywordGroup,
      singleKeyword
    } = this.state;
    const keywordListNPP = fullKeywordList
      .filter(el => el.category === '時代力量')
      .map((el, i) =>
        <li
          key={el.uuid}
          className={styles.keywords}
          onClick={() => this._handleDeleteAlert(el)}
        > {el.keyword} </li>);

    const keywordListTopics = fullKeywordList
      .filter(el => el.category === '熱門議題')
      .map((el, i) =>
        <li
          key={el.uuid}
          className={styles.keywords}
          onClick={() => this._handleDeleteAlert(el)}
        > {el.keyword} </li>);

    const keywordListPolicies = fullKeywordList
      .filter(el => el.category === '政策')
      .map((el, i) =>
        <li
          key={el.uuid}
          className={styles.keywords}
          onClick={() => this._handleDeleteAlert(el)}
        > {el.keyword} </li>);

    const keywordListOthers = fullKeywordList
      .filter(el => (el.category === '其他') || !el.category)
      .map((el, i) =>
        <li
          key={el.uuid}
          className={styles.keywords}
          onClick={() => this._handleDeleteAlert(el)}
        > {el.keyword} </li>);

    let newsCount = 0;

    const newsListElement = newsList
      .sort((a, b) => (new Date(b.whenLastUpdate)).getTime() - (new Date(a.whenLastUpdate)).getTime())
      .map((source, i) => {
        const newsItems = source.item
        .filter(el => this._hasKeywords(el.title, keywordList) || this._hasKeywords(el.body, keywordList))
        .map(el => {
          if (el) {
            newsCount += 1;
          }
          return (
            <li key={el.id} className={styles.newsItem}>
              <a href={el.link} target="_blank"><h2 className={styles.newsTitle}>{el.title} </h2></a>
              <p className={styles.newsBody}>{el.body === '...' ? '' : el.body}</p>
              <p className={styles.newsTime}> {moment(el.pubDate).tz('Asia/Taipei').fromNow()} </p>
            </li>);
        });

        const domain = source.websiteUrl.split('/')[2];
        return newsItems.length > 0 ? (
          <li key={i} style={{width: '100%'}}>
           <p className={styles.sectionTitle}>
            <img src={`http://www.google.com/s2/favicons?domain=${domain}`} width={16} height={16} /> <a href={source.websiteUrl}>{source.feedTitle}</a>
            <span className={styles.feedUpdateTime}>{moment(source.whenLastUpdate).tz('Asia/Taipei').format('MMMM Do YYYY, h:mm:ss a')}</span>
          </p>
            <ul style={{listStyle: 'none'}}>
              {newsItems}
            </ul>
          </li>
        ) : null;
      });

    return (
      <div>
        <Container className={styles.landingBody}>
        	<Row>
	           {this.props.nav === 'keyword' &&
              (<Col md="8" md-offset="2">
              <h1 id="check-in"> 關鍵字編輯區</h1>
              <div style={{display: 'flex'}}>
               <Input
                style={{width: '40%', marginRight: 15}}
                value={this.state.keyword}
                label="輸入關鍵字" floatingLabel={true}
                onKeyDown={this._onKeyDown}
                onChange={this._onChangeKeyword} />
                <Select
                  style={{width: '40%', marginRight: 15}}
                  value={this.state.category}
                  onChange={this.handleSelect}>
                  <Option value="時代力量" label="時代力量" />
                  <Option value="熱門議題" label="熱門議題" />
                  <Option value="政策" label="政策" />
                  <Option value="其他" label="其他" />
                </Select>
                <Button
                  variant="raised"
                  onClick={this._onSave}
                  style={{marginTop: 10}}
                >新增</Button>
                </div>
             </Col>)}

             <Col md="10" md-offset="1">
              {this.props.nav === 'intel' &&
              (<div>
                <div className={styles.selectionBar}>
                  <div
                    className={keywordGroup === 'all' ? styles.keywordSelected : styles.keywordSelection}
                    onMouseEnter={() => this.setHoveredKeyword('all ')}
                    onClick={() => this.setSubKeyword('all')}
                  >全選</div>
                  <div
                    className={keywordGroup === '時代力量' ? styles.keywordSelected : styles.keywordSelection}
                    onMouseEnter={() => this.setHoveredKeyword('時代力量')}
                    onClick={() => this.setSubKeyword('時代力量')}
                  >時代力量</div>
                  <div
                    className={keywordGroup === '熱門議題' ? styles.keywordSelected : styles.keywordSelection}
                    onMouseEnter={() => this.setHoveredKeyword('熱門議題')}
                    onClick={() => this.setSubKeyword('熱門議題')}
                  >熱門議題</div>
                  <div
                    className={keywordGroup === '政策' ? styles.keywordSelected : styles.keywordSelection}
                    onMouseEnter={() => this.setHoveredKeyword('政策')}
                    onClick={() => this.setSubKeyword('政策')}
                  >政策</div>
                  <div
                    className={keywordGroup === '其他' ? styles.keywordSelected : styles.keywordSelection}
                    onMouseEnter={() => this.setHoveredKeyword('其他')}
                    onClick={() => this.setSubKeyword('其他')}
                  >其他</div>
                  {/*<div className={styles.keywordSelection} onMouseEnter={() => this.setHoveredKeyword('其他')}>其他</div>
                  <div className={styles.keywordSelection} >自訂搜索</div>*/}
                </div>
                <div className={styles.selectionBar}>
                  {hoveredKeyword &&
                    fullKeywordList
                    .filter(el => el.category === hoveredKeyword)
                    .map(el =>
                      <div
                        key={el.uuid}
                        className={singleKeyword === el.keyword ? styles.keywordSubgroupSelected : styles.keywordSubgroup}
                        onClick={() => this.setSingleKeyword(el.keyword)}
                      > {el.keyword} </div>)}
                </div>
              </div>)}
              <Panel style={{minHeight: 800, overflow: 'scroll'}}>
                  {this.props.nav === 'keyword' ?
                  (
                  <ul className={styles.flexbox}>
                    <p className={styles.sectionTitleKeyword}>時代力量</p>
                    {keywordListNPP}
                    <p className={styles.sectionTitleKeyword}>熱門議題</p>
                    {keywordListTopics}
                    <p className={styles.sectionTitleKeyword}>政策</p>
                    {keywordListPolicies}
                    <p className={styles.sectionTitleKeyword}>其他</p>
                    {keywordListOthers}
                  </ul>
                  )
                  :
                  (<ul className={styles.flexbox}>
                    <h3>我們找到 {newsCount} 件符合您關鍵字的新聞</h3>
                    {newsListElement}
                  </ul>)
                  }
              </Panel>
             </Col>
      		</Row>
        </Container>
			</div>
		);
	}
}
