import React from 'react';
import PropTypes from 'prop-types';
import take from 'lodash/take';
import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';
import { scroller } from 'react-scroll';
import { Link } from 'react-router-dom';
import { Icon, Modal } from 'antd';
import Topic from '../Button/Topic';
import classNames from 'classnames';
import withAuthActions from '../../auth/withAuthActions';
import { sortVotes } from '../../helpers/sortHelpers';
import { getUpvotes, getDownvotes } from '../../helpers/voteHelpers';
import Popover from '../Popover';
import BTooltip from '../BTooltip';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import ReactionsModal from '../Reactions/ReactionsModal';
import USDDisplay from '../Utils/USDDisplay';
import './Buttons.less';
import Action from '../Button/Action';

@injectIntl
@withAuthActions
export default class Buttons extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    post: PropTypes.shape().isRequired,
    postState: PropTypes.shape().isRequired,
    defaultVotePercent: PropTypes.number.isRequired,
    onActionInitiated: PropTypes.func.isRequired,
    ownPost: PropTypes.bool,
    pendingLike: PropTypes.bool,
    pendingFlag: PropTypes.bool,
    pendingFollow: PropTypes.bool,
    pendingBookmark: PropTypes.bool,
    saving: PropTypes.bool,
    onLikeClick: PropTypes.func,
    onDislikeClick: PropTypes.func,
    onShareClick: PropTypes.func,
    handlePostPopoverMenuClick: PropTypes.func,
    handleTransferClick: PropTypes.func,
  };

  static defaultProps = {
    ownPost: false,
    pendingLike: false,
    pendingFlag: false,
    pendingFollow: false,
    pendingBookmark: false,
    saving: false,
    onLikeClick: () => {},
    onDislikeClick: () => {},
    onShareClick: () => {},
    handlePostPopoverMenuClick: () => {},
    handleTransferClick: () => {},
  };

  static handleCommentClick() {
    const form = document.getElementById('commentFormInput');
    if (form) {
      scroller.scrollTo('commentFormInputScrollerElement', {
        offset: 50,
      });
      form.focus();
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      shareModalVisible: false,
      shareModalLoading: false,
      reactionsModalVisible: false,
      loadingEdit: false,
    };

    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.handleDislikeClick = this.handleDislikeClick.bind(this);
    this.shareClick = this.shareClick.bind(this);
    this.handleShareClick = this.handleShareClick.bind(this);
    this.handleShareOk = this.handleShareOk.bind(this);
    this.handleShareCancel = this.handleShareCancel.bind(this);
    this.handleShowReactions = this.handleShowReactions.bind(this);
    this.handleCloseReactions = this.handleCloseReactions.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.postState.isReblogging !== this.props.postState.isReblogging) {
      this.setState({
        shareModalLoading: nextProps.postState.isReblogging,
        shareModalVisible:
          !(!nextProps.postState.isReblogging && this.props.postState.isReblogging) &&
          this.state.shareModalVisible,
      });
    }
  }

  handleLikeClick() {
    this.props.onActionInitiated(this.props.onLikeClick);
  }
  handleDislikeClick() {
    this.props.onActionInitiated(this.props.onDislikeClick);
  }

  shareClick() {
    if (this.props.postState.isReblogged) {
      return;
    }

    this.setState({
      shareModalVisible: true,
    });
  }

  handleShareClick(e) {
    e.preventDefault();
    this.props.onActionInitiated(this.shareClick);
  }

  handleShareOk() {
    this.props.onShareClick();
  }

  handleShareCancel() {
    this.setState({
      shareModalVisible: false,
    });
  }

  handleShowReactions() {
    this.setState({
      reactionsModalVisible: true,
    });
  }

  handleCloseReactions() {
    this.setState({
      reactionsModalVisible: false,
    });
  }

  renderPostPopoverMenu() {
    const {
      pendingFlag,
      pendingFollow,
      pendingBookmark,
      saving,
      postState,
      intl,
      post,
      handlePostPopoverMenuClick,
			ownPost,
			handleTransferClick
    } = this.props;
    const { isReported } = postState;

    let followText = '';

    if (postState.userFollowed && !pendingFollow) {
      followText = intl.formatMessage(
        { id: 'unfollow_username', defaultMessage: 'Unfollow {username}' },
        { username: post.author },
      );
    } else if (postState.userFollowed && pendingFollow) {
      followText = intl.formatMessage(
        { id: 'unfollow_username', defaultMessage: 'Unfollow {username}' },
        { username: post.author },
      );
    } else if (!postState.userFollowed && !pendingFollow) {
      followText = intl.formatMessage(
        { id: 'follow_username', defaultMessage: 'Follow {username}' },
        { username: post.author },
      );
    } else if (!postState.userFollowed && pendingFollow) {
      followText = intl.formatMessage(
        { id: 'follow_username', defaultMessage: 'Follow {username}' },
        { username: post.author },
      );
    }
		let sendToAuthor = `Send to ${post.author}`;

    let popoverMenu = [
			<PopoverMenuItem key="sendMoney">
				<Action className="send-money" onClick={handleTransferClick}>
					<FormattedMessage id="sendmoneytoauthor" defaultMessage={sendToAuthor} />
					<img src="/images/dollar.png" className="send-dollar on-right"/>
				</Action>
			</PopoverMenuItem>,
			<PopoverMenuItem key="storyTopics">
				<div className="Story__topics__list">
					<span className="Story_topics__label">
						{`Tags: `}
					</span>
					<span className="Story__topics">
						<Topic name={post.category} />
					</span>
				</div>
			</PopoverMenuItem>
		];

    if (ownPost && post.cashout_time !== '1969-12-31T23:59:59') {
      popoverMenu = [
        ...popoverMenu,
        <PopoverMenuItem key="edit">
          {saving ? <Icon type="loading" /> : <i className="iconfont icon-write" />}
          <FormattedMessage id="edit_post" defaultMessage="Edit post" />
        </PopoverMenuItem>,
      ];
    }

    if (!ownPost) {
      popoverMenu = [
        ...popoverMenu,
        <PopoverMenuItem key="follow" disabled={pendingFollow}>
          {pendingFollow ? <Icon type="loading" /> : <i className="iconfont icon-people" />}
          {followText}
        </PopoverMenuItem>,
      ];
    }

		popoverMenu = [
      ...popoverMenu,
      <PopoverMenuItem key="save">
        {pendingBookmark ? <Icon type="loading" /> : <i className="iconfont icon-collection" />}
        <FormattedMessage
          id={postState.isSaved ? 'unsave_post' : 'save_post'}
          defaultMessage={postState.isSaved ? 'Unsave post' : 'Save post'}
        />
      </PopoverMenuItem>,
      <PopoverMenuItem key="report">
        {pendingFlag ? (
          // <Icon type="loading" />
					<i
						className={classNames('iconfont', {
							'icon-flag': !postState.isReported,
							'icon-flag_fill': postState.isReported,
						})}
					/>

        ) : (
          <i
            className={classNames('iconfont', {
              'icon-flag': !postState.isReported,
              'icon-flag_fill': postState.isReported,
            })}
          />
        )}
        {isReported ? (
          <FormattedMessage id="unflag_post" defaultMessage="Unflag post" />
        ) : (
          <FormattedMessage id="flag_post" defaultMessage="Flag post" />
        )}
			</PopoverMenuItem>
    ];

    return (
			<div className="button__group">
				<Popover
					placement="bottomRight"
					trigger="click"
					content={
						<PopoverMenu onSelect={handlePostPopoverMenuClick} bold={false}>
							{popoverMenu}
						</PopoverMenu>
					}
				>
					<i className="Buttons__post-menu iconfont icon-more" />
				</Popover>
			</div>
    );
  }

  render() {
    const { intl, post, postState, pendingLike, pendingDislike, pendingFlag, ownPost, defaultVotePercent } = this.props;

    const upVotes = getUpvotes(post.active_votes).sort(sortVotes);
    const downVotes = getDownvotes(post.active_votes)
      .sort(sortVotes)
      .reverse();

    const totalPayout =
      parseFloat(post.pending_payout_value) +
      parseFloat(post.total_payout_value) +
      parseFloat(post.curator_payout_value);
    const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
    const ratio = totalPayout / voteRshares;

    const upVotesPreview = take(upVotes, 10).map(vote => (
      <p key={vote.voter}>
        <Link to={`/@${vote.voter}`}>{vote.voter}</Link>

        {vote.rshares * ratio > 0.01 && (
          <span style={{ opacity: '0.5' }}>
            {' '}
            <USDDisplay value={vote.rshares * ratio} />
          </span>
        )}
      </p>
    ));
    const upVotesDiff = upVotes.length - upVotesPreview.length;
    const upVotesMore = upVotesDiff > 0 && (
      <p>
        <a role="presentation" onClick={this.handleShowReactions}>
          <FormattedMessage
            id="and_more_amount"
            defaultMessage="and {amount} more"
            values={{ amount: upVotesDiff }}
          />
        </a>
      </p>
		);
		
    const downVotesPreview = take(downVotes, 10).map(vote => (
      <p key={vote.voter}>
        <Link to={`/@${vote.voter}`}>{vote.voter}</Link>

        {vote.rshares * ratio > 0.01 && (
          <span style={{ opacity: '0.5' }}>
            {' '}
            <USDDisplay value={vote.rshares * ratio} />
          </span>
        )}
      </p>
    ));
    const downVotesDiff = downVotes.length - downVotesPreview.length;
    const downVotesMore = downVotesDiff > 0 && (
      <p>
        <a role="presentation" onClick={this.handleShowReactions}>
          <FormattedMessage
            id="and_more_amount"
            defaultMessage="and {amount} more"
            values={{ amount: downVotesDiff }}
          />
        </a>
      </p>
    );

    const likeClass = classNames({ active: postState.isLiked || (pendingLike && !pendingDislike), Buttons__link: true });
    const dislikeClass = classNames({ active: postState.isDisliked || (!pendingLike && pendingDislike), Buttons__link: true });
    const rebloggedClass = classNames({ active: postState.isReblogged, Buttons__link: true });

    const commentsLink =
      post.url.indexOf('#') !== -1 ? post.url : { pathname: post.url, hash: '#comments' };
    const showReblogLink = !ownPost && post.parent_author === '';

    let likeTooltip = <span>{intl.formatMessage({ id: 'like' })}</span>;
    if (postState.isLiked) {
      likeTooltip = <span>{intl.formatMessage({ id: 'unlike', defaultMessage: 'Unlike' })}</span>;
    } else if (defaultVotePercent !== 10000) {
      likeTooltip = (
        <span>
          {intl.formatMessage({ id: 'like' })}{' '}
          {/* <span style={{ opacity: 0.5 }}>
            <FormattedNumber
              style="percent" // eslint-disable-line
              value={defaultVotePercent / 10000}
            />
          </span> */}
        </span>
      );
		}
		
    let dislikeTooltip = <span>{intl.formatMessage({ id: 'dislike' })}</span>;
    if (postState.isDisliked) {
      dislikeTooltip = <span>{intl.formatMessage({ id: 'undislike', defaultMessage: 'Undislike' })}</span>;
    } else if (defaultVotePercent !== 10000) {
      dislikeTooltip = (
        <span>
          {intl.formatMessage({ id: 'dislike' })}{' '}
          {/* <span style={{ opacity: 0.5 }}>
            <FormattedNumber
              style="percent" // eslint-disable-line
              value={defaultVotePercent / -10000}
            />
          </span> */}
        </span>
      );
    }

    return (
      <div className="Buttons">
				<div className="button__group">
					<BTooltip title={likeTooltip}>
						<a role="presentation" className={likeClass} onClick={this.handleLikeClick}>
							{pendingLike ? (
								// <Icon type="loading" />
								<i
									className={`iconfont icon-${this.state.sliderVisible ? 'right' : 'praise_fill'}`}
								/>

							) : (
								<i
									className={`iconfont icon-${this.state.sliderVisible ? 'right' : 'praise_fill'}`}
								/>
							)}
						</a>
					</BTooltip>
					{/* {post.active_votes.length > 0 && upVotes.length > 0 && ( */}
						<span
							className="Buttons__number Buttons__reactions-count"
							role="presentation"
							onClick={this.handleShowReactions}
						>
							<BTooltip
								title={
									<div>
										{upVotes.length > 0 ? (
											upVotesPreview
										) : (
											<FormattedMessage id="no_likes" defaultMessage="No likes yet" />
										)}
										{upVotesMore}
									</div>
								}
							>
								{ upVotes.length > 0 && <FormattedNumber value={upVotes.length} /> }
								<span />
							</BTooltip>
						</span>
				</div>
        {/* )} */}
				<div className="button__group">
					<BTooltip 
						title={dislikeTooltip}>
						<a 
							role="presentation" 
							className={dislikeClass} 
							onClick={this.handleDislikeClick}>
							{pendingDislike ? (
								// <Icon type="loading" />
								<i
									className={`iconfont icon-${this.state.sliderVisible ? 'right' : 'thumb-down'}`}
								/>
							) : (
								<i
									className={`iconfont icon-${this.state.sliderVisible ? 'right' : 'thumb-down'}`}
								/>
							)}
						</a>
					</BTooltip>
					<span
						className="Buttons__number Buttons__reactions-count"
						role="presentation"
						onClick={this.handleShowReactions}
					>
						<BTooltip
							title={
								<div>
									{downVotes.length > 0 ? (
										downVotesPreview
									) : (
										<FormattedMessage id="no_dislikes" defaultMessage="No dislikes yet" />
									)}
									{downVotesMore}
								</div>
							}
						>
							{ downVotes.length > 0 && <FormattedNumber value={downVotes.length} /> }
							<span />
						</BTooltip>
					</span>
				</div>
        {/* {downVotes.length > 0 && ( */}
				{/* )} */}
				<div className="button__group">
					<BTooltip title={intl.formatMessage({ id: 'comment', defaultMessage: 'Comment' })}>
						<Link className="Buttons__link" to={commentsLink} onClick={this.handleCommentClick}>
							<i className="iconfont icon-message_fill" />
						</Link>
					</BTooltip>
					<span className="Buttons__number">
						{post.children > 0 && <FormattedNumber value={post.children} />}
					</span>
				</div>
				{showReblogLink && (
					<div className="button__group">
						<BTooltip
							title={intl.formatMessage({
								id: postState.reblogged ? 'reblog_reblogged' : 'reblog',
								defaultMessage: postState.reblogged ? 'You already reblogged this post' : 'Reblog',
							})}
						>
							<a role="presentation" className={rebloggedClass} onClick={this.handleShareClick}>
								<i className="iconfont icon-share1 Buttons__share" />
							</a>
						</BTooltip>
					</div>
				)}
				{this.renderPostPopoverMenu()}
				{/* <div className="button__group">
				</div> */}
				{!postState.isReblogged && (
					<Modal
						title={intl.formatMessage({
							id: 'reblog_modal_title',
							defaultMessage: 'Reblog this post?',
						})}
						visible={this.state.shareModalVisible}
						confirmLoading={this.state.shareModalLoading}
						okText={intl.formatMessage({ id: 'reblog', defaultMessage: 'Reblog' })}
						cancelText={intl.formatMessage({ id: 'cancel', defaultMessage: 'Cancel' })}
						onOk={this.handleShareOk}
						onCancel={this.handleShareCancel}
					>
						<FormattedMessage
							id="reblog_modal_content"
							defaultMessage="This post will appear on your personal feed. This action cannot be reversed."
						/>
					</Modal>
				)}
        <ReactionsModal
          visible={this.state.reactionsModalVisible}
          upVotes={upVotes}
          ratio={ratio}
          downVotes={downVotes}
          onClose={this.handleCloseReactions}
        />
      </div>
    );
  }
}
