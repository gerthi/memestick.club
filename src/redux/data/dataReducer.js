const initialState = {
  loading: false,
  name: '',
  totalSupply: 0,
  cost: 0,
  balance: 0,
  error: false,
  owner: '',
  errorMsg: '',
  isWhitelisted: '',
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHECK_DATA_REQUEST':
      return {
        ...state,
        loading: true,
        error: false,
        errorMsg: '',
      };
    case 'CHECK_DATA_SUCCESS':
      return {
        ...state,
        loading: false,
        name: action.payload.name,
        totalSupply: action.payload.totalSupply,
        cost: action.payload.cost,
        balance: action.payload.balance,
        error: false,
        owner: action.payload.owner,
        errorMsg: '',
        isWhitelisted: action.payload.isWhitelisted,
      };
    case 'CHECK_DATA_FAILED':
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
