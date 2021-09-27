import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connect } from './redux/blockchain/blockchainActions';
import { fetchData } from './redux/data/dataActions';
import * as s from './styles/globalStyles';
import styled from 'styled-components';
import i1 from './assets/images/1.png';

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  margin: 10px 0;
  background-color: #ffffff;
  padding: 12px;
  font-weight: bold;
  color: var(--dark-grey);
  width: 150;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px var(--yellow);
  -webkit-box-shadow: 0px 6px 0px -2px var(--yellow);
  -moz-box-shadow: 0px 6px 0px -2px var(--yellow);
  transition: all 0.3s;
  align-self: center;

  :hover {
    transform: translateY(3px);
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.4;
  }

  @media (min-width: 767px) {
    align-self: baseline;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledImg = styled.img`
  width: 300px;
  height: 300px;
  @media (min-width: 767px) {
    align-self: flex-end;
    width: 400px;
    height: 400px;
  }
  transition: width 0.25s;
  transition: height 0.25s;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const [feedbackType, setFeedbackType] = useState('');
  const data = useSelector((state) => state.data);
  const [orderAmount, setOrderAmount] = useState(1);
  const [feedback, setFeedback] = useState('Will you get the golden crown ?');
  const [claimingNft, setClaimingNft] = useState(false);

  let orderMessage;
  if (orderAmount == 1) {
    orderMessage = ' Meme Stick 🙏';
  } else if (orderAmount > 1 && orderAmount <= 3) {
    orderMessage = ' Meme Sticks 🙏🚀';
  } else if (orderAmount > 3 && orderAmount < 8) {
    orderMessage = ' Meme Sticks 🙏🚀🤯';
  } else {
    orderMessage = ' Meme Sticks 🙏🚀🤯🐳';
  }

  const claimNFTs = (_amount) => {
    const isOwner =
      blockchain.account.toUpperCase() == data.owner.toUpperCase();
    // console.log(`user is whitelisted ${data.isWhitelisted}`);
    // console.log(`user is owner ${isOwner}`);
    const price = data.isWhitelisted || isOwner ? 0 : 0.01;
    if (_amount <= 0) {
      return;
    }
    if (data.balance + _amount > 20 && !isOwner && !data.isWhitelisted) {
      // console.log(`${blockchain.account} owns already ${data.balance}`);
      // console.log(`amount order : ${_amount}`);
      setFeedbackType('error');
      setFeedback("Sorry but you can't own more than 10 Meme Sticks !");
      return;
    }
    setFeedbackType('waiting');
    setFeedback(`Grabbing your Meme Stick${orderAmount > 1 ? 's' : ''}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(_amount)
      .send({
        gasLimit: '285000',
        // to: '0xfb9ff562753a31d63d58a34fcf649e263a4477b4',
        from: blockchain.account,
        value: blockchain.web3.utils.toWei(
          (price * _amount).toString(),
          'ether'
        ),
      })
      .once('error', (err) => {
        console.log(err);
        setFeedbackType('error');
        setFeedback('Hmm, something went wrong maybe try again ?');
        setClaimingNft(false);
      })
      .then((receipt) => {
        setFeedbackType('success');
        setFeedback(
          `You just received ${orderAmount} ${
            orderAmount > 1 ? 'Meme Sticks' : 'Meme Stick'
          } ! See your collection on Opensea.io 🎉`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        setOrderAmount(1);
      });
  };

  const getData = () => {
    if (blockchain.account !== '' && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen style={{ backgroundColor: 'var(--white)' }}>
      <s.Container flex={1} ai={'center'} style={{ padding: 24 }}>
        <div style={{ position: 'relative' }}>
          <s.TextTitle
            style={{
              textAlign: 'center',
              fontSize: 35,
              fontWeight: 'bold',
              margin: '30px 0',
            }}
          >
            MEME STICKS CLUB{' '}
          </s.TextTitle>
          <p className='verified'>
            pssst, we're
            <a
              href='https://etherscan.io/address/0xc5d71b6f31608a64e123d0ad2f9fb340978bcb23#readContract'
              target='_blank'
            >
              &nbsp;verified&nbsp;
            </a>
            on etherscan
          </p>
        </div>
        <ResponsiveWrapper flex={1} style={{ padding: 24 }}>
          <s.Container
            flex={1}
            jc={'center'}
            ai={'center'}
            style={{ justifySelf: 'flex-end', gap: '10px' }}
          >
            <StyledImg alt={'memestick example'} src={i1} />
            <s.SpacerMedium />
            {blockchain.account && (
              <span
                className='mintedInfo'
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                }}
              >
                {data.totalSupply}/2500 minted
              </span>
            )}
          </s.Container>
          <s.SpacerMedium />
          <s.Container flex={1} jc={'center'} style={{ padding: 24 }}>
            {Number(data.totalSupply) == 2500 ? (
              <>
                <s.TextTitle>
                  Sold out ! <br />
                </s.TextTitle>
                <s.SpacerSmall />
                <s.TextDescription>
                  You can still buy one of the 2500 Meme Sticks on{' '}
                  <a
                    target={'_blank'}
                    href={'https://opensea.io/collection/meme-sticks'}
                  >
                    Opensea.io
                  </a>
                </s.TextDescription>
              </>
            ) : (
              <>
                <s.TextTitle style={{ maxWidth: '300px' }}>
                  2500 uniques sticks bringing meme joy to the NFT world.
                </s.TextTitle>
                <s.SpacerSmall />
                <s.TextSubTitle>
                  Price is <span className='underlined'>0.01 ETH</span>
                </s.TextSubTitle>
                <s.SpacerSmall />
                <s.TextDescription className={'feedback ' + feedbackType}>
                  {feedback}
                </s.TextDescription>
                {blockchain.account === '' ||
                blockchain.smartContract === null ? (
                  <s.Container ai={'center'} jc={'center'}>
                    <s.TextDescription light>
                      Connect to the Ethereum network
                    </s.TextDescription>
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT WALLET
                    </StyledButton>
                    {blockchain.errorMsg !== '' ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription>
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <s.Container
                    className='mainZone'
                    ai={'flex-start'}
                    jc={'center'}
                    fd={'column'}
                  >
                    I want to buy{' '}
                    <input
                      type='range'
                      id='quantity'
                      name='quantity'
                      min='1'
                      max='10'
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                    />
                    <label htmlFor='quantity'>
                      {orderAmount}
                      {orderMessage}
                    </label>
                    <br />
                    <StyledButton
                      className='tooltip'
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs(orderAmount);
                        getData();
                      }}
                    >
                      {claimingNft ? 'WAIT FOR IT...' : 'CLAIM 🤑'}
                    </StyledButton>
                    <span style={{ opacity: 0.5, marginTop: '6px' }}>
                      You'll need to confirm the transaction on MetaMask.
                    </span>
                  </s.Container>
                )}
              </>
            )}
          </s.Container>
        </ResponsiveWrapper>

        <s.Container
          jc={'center'}
          ai={'center'}
          style={{
            backgroundColor: '#fff',
            width: '100vw',
            padding: '60px 0',
            marginTop: '40px',
          }}
        >
          <s.TextTitle
            style={{
              textAlign: 'center',
              fontSize: 28,
              fontWeight: 'bold',
            }}
          >
            GUARANTEES
          </s.TextTitle>
          <Guarantees>
            <ul>
              <li>
                <i className='fas fa-check'></i>&nbsp;No presale
              </li>
              <li>
                <i className='fas fa-check'></i>&nbsp;No bullshit perks
              </li>
              <li>
                <i className='fas fa-check'></i>&nbsp;No fake community
              </li>
            </ul>
            <ul>
              <li>
                <i className='fas fa-check'></i>&nbsp;No "game"
              </li>
              <li>
                <i className='fas fa-check'></i>&nbsp;No whales
              </li>
              <li>
                <i className='fas fa-check'></i>&nbsp;Just the meme stick
              </li>
            </ul>
          </Guarantees>
        </s.Container>
        <Gallery>
          <div className='photobanner'>
            <img src={'/assets/2.png'} alt='' />
            <img src={'/assets/3.png'} alt='' />
            <img src={'/assets/4.png'} alt='' />
            <img src={'/assets/5.png'} alt='' />
            <img src={'/assets/6.png'} alt='' />
            <img src={'/assets/7.png'} alt='' />
            <img src={'/assets/8.png'} alt='' />
            <img src={'/assets/9.png'} alt='' />
            <img src={'/assets/10.png'} alt='' />
            <img src={'/assets/11.png'} alt='' />
            <img src={'/assets/12.png'} alt='' />
            <img src={'/assets/13.png'} alt='' />
            <img src={'/assets/14.png'} alt='' />
            <img src={'/assets/15.png'} alt='' />
          </div>
        </Gallery>
        <s.Container
          jc={'center'}
          ai={'center'}
          style={{ marginTop: '40px', maxWidth: '650px' }}
          className='FAQ'
        >
          <s.TextTitle
            style={{
              textAlign: 'center',
              fontSize: 28,
              fontWeight: 'bold',
            }}
          >
            F.A.Q
          </s.TextTitle>
          <s.TextSubTitle
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            Is this a scam ?
          </s.TextSubTitle>
          <s.TextDescription style={{ textAlign: 'center', marginTop: '8px' }}>
            No it's not !
            <br />
            <br />
            It's just a simple NFT project, made with love with my two hands.
            The ethereum smartContract handles everything and has been &nbsp;
            <a
              href='https://etherscan.io/address/0xc5d71b6f31608a64e123d0ad2f9fb340978bcb23#readContract'
              target='_blank'
            >
              verified on etherscan
            </a>
            .
            <br />
          </s.TextDescription>
          <s.TextSubTitle
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            But why would I pay for a meme stick ?
          </s.TextSubTitle>
          <s.TextDescription style={{ textAlign: 'center', marginTop: '8px' }}>
            Because they're cute & fun, because you're loaded, because you'll be
            supporting an indie solo dev, to brag in front of your friends, to
            make money, to make the world a better place, to save dolphins...
            <br />
            <br />
            The real question is why would you <u>not buy a meme stick ?</u>
          </s.TextDescription>
          <s.TextSubTitle
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            Why would I not buy a meme stick ?
          </s.TextSubTitle>
          <s.TextDescription style={{ textAlign: 'center', marginTop: '8px' }}>
            If you’re still not convinced to buy a meme stick, you probably :
            <br />
            <br />
            1) Don't understand{' '}
            <a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'>memes</a>
            <br /> 2) Have no friends
            <br /> 3) Hate dolphins for some reasons
            <br /> 4) Are some kind of psychopath
            <br /> 5) Obi Wan Kenobi
          </s.TextDescription>

          <s.TextSubTitle
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            Will there be others Meme Sticks ?
          </s.TextSubTitle>
          <s.TextDescription style={{ textAlign: 'center', marginTop: '8px' }}>
            Once the first 2500 are soldout and we saved all the dolphins, I’ll
            make another collection and we’ll find another animal to save.
            <br />
            <br />
            Maybe then I’ll even create a Twitter account.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export const Gallery = styled.div`
  height: 100px;
  position: relative;
  margin-bottom: 80px;

  .photobanner {
    position: absolute;
    top: 0px;
    left: 0px;
    overflow: hidden;
    white-space: nowrap;
    animation: bannermove 30s linear infinite alternate;

    &:hover {
      animation-play-state: paused;
    }
  }

  .photobanner img {
    height: 175px;
    margin: 0 0.1em;
  }

  @keyframes bannermove {
    0% {
      transform: translate(-25%, 0);
    }
    100% {
      transform: translate(-75%, 0);
    }
  }
`;

export const Guarantees = styled.div`
  display: flex;
  color: var(--dark-grey);
  padding-top: 20px;
  padding-left: 40px;
  width: 70%;
  gap: 130px;
  justify-content: center;
  font-size: 16px;
  ul {
    margin-top: 40px;
  }
  ul:nth-child(2) > li:nth-child(3) {
    font-weight: bold;
  }
  li {
    position: relative;
    line-height: 2em;
    @media (min-width: 767px) {
      font-size: 22px;
    }
  }
  i {
    line-height: 2em;
    position: absolute;
    color: var(--green);
    left: -2rem;
  }
`;

export default App;
