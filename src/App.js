import React, { useEffect, useState, useRef } from 'react';
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
    if (_amount <= 0) {
      return;
    }
    const isOwner =
      blockchain.account.toUpperCase() == data.owner.toUpperCase();
    if (data.balance + _amount > 10 && !isOwner) {
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
        // gasLimit: '285000',
        // to: '0xfb9ff562753a31d63d58a34fcf649e263a4477b4',
        from: blockchain.account,
        value: blockchain.web3.utils.toWei(
          (0.01 * _amount).toString(),
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
          } ! Congrats 🎉`
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
    console.log(data.isOwner);
  }, [blockchain.account]);

  return (
    <s.Screen style={{ backgroundColor: 'var(--white)' }}>
      <s.Container flex={1} ai={'center'} style={{ padding: 24 }}>
        <s.TextTitle
          style={{ textAlign: 'center', fontSize: 35, fontWeight: 'bold' }}
        >
          MEME STICKS CLUB
        </s.TextTitle>
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
          style={{ backgroundColor: '#fff', width: '100vw', padding: '60px 0' }}
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
            But why would I pay for a meme stick ?
          </s.TextSubTitle>
          <s.TextDescription style={{ textAlign: 'center', marginTop: '8px' }}>
            Cuz they cute & fun, cuz ur loaded, cuz you’re supporting an indie
            solo dev, to brag in front of ur friends, to make money, to make the
            world a better place, to save dolphins.
            <br />
            <br />
            The real question is why would you not buy a meme stick ?
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
            1) Are a psychopath
            <br /> 2) Don’t want to save dolphins
            <br /> 3) Got no friends
            <br /> 4) Don’t know what{' '}
            <a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'>memes</a> are
            ?<br /> 5) Obi Wan Kenobi
          </s.TextDescription>
          <s.TextSubTitle
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontWeight: 'bold',
            }}
          >
            Who the f are you ?
          </s.TextSubTitle>
          <s.TextDescription style={{ textAlign: 'center', marginTop: '8px' }}>
            I’m an indie developer trying to survive in this mess of a world we
            live in.
            <br /> I’m probably vaccinated, and I love dolphins or maybe they
            scare the shit out of me I can’t remember.
            <br />
            <br />
            Please buy my memes so I can eat & pay rent this month.
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
