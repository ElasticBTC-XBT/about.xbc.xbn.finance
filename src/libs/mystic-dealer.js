import {getXBTContract} from "@/libs/xbt";

export const MysticDealer = {
    address: process.env.VUE_APP_MYSTIC_DEALER_ADDRESS,
    jsonInterface: require('@/assets/contracts/MysticDealer.json')
}

export const getDealerContract = async (web3Client) => {
    const accounts = await web3Client.eth.getAccounts();
    return new web3Client.eth.Contract(
        MysticDealer.jsonInterface.abi,
        MysticDealer.address,
        {
            gas: 240000,
            from: accounts[0]
        }
    );
}

export const getSaleSupply = async (web3Client) => {
    const contract = await getXBTContract(web3Client);

    const balance = await contract.methods.balanceOf(MysticDealer.address).call();
    const decimals = await contract.methods.decimals().call();

    return balance / (10 ** decimals);
};

export const getSaleRule = async (web3Client) => {
    const xbtContract = await getXBTContract(web3Client);
    const dealerContract = await getDealerContract(web3Client);

    const decimals = await xbtContract.methods.decimals().call();
    const saleRule = await dealerContract.methods.getSaleRule().call();

    const {
        '0': minBidAmount, '1': maxBidAmount, '2': exchangeRate
    } = saleRule;

    return {
        minBidAmount: Number(web3Client.utils.fromWei(minBidAmount.toString(), 'ether')),
        maxBidAmount: Number(web3Client.utils.fromWei(maxBidAmount.toString(), 'ether')),
        exchangeRate: Number(exchangeRate) / (10 ** decimals),
    };
};

export const getOrderMetaOf = async (web3Client, account) => {
    const dealerContract = await getDealerContract(web3Client);

    const [luckyNumber, participantWaitTime] = await dealerContract.methods.getOrderMetaOf(account).call();

    return {
        luckyNumber: Number(luckyNumber), participantWaitTime: Number(participantWaitTime) * 1000
    };
}

export const getOrderBook = async (web3Client) => {
    const dealerContract = await getDealerContract(web3Client);
    const xbtContract = await getXBTContract(web3Client);
    const decimals = await xbtContract.methods.decimals().call();

    const data = await dealerContract.methods.getOrderBook().call();
    const orderBook = data.map(order => parseOrderBook(
        order,
        decimals,
        (val) => Number(web3Client.utils.fromWei(val.toString(), 'ether'))
    ));
    orderBook.sort((o1, o2) => o2.timestamp - o1.timestamp);
    return orderBook;
}

const parseOrderBook = (orderBook, xbtDecimals, convertToEther) => {
    const [
        price,
        buyerAddress,
        bonusWon,
        timestamp,
        purchasedTokenAmount,
        totalETHValue
    ] = orderBook;
    return {
        price: Number(price) / (10 ** xbtDecimals),
        buyerAddress,
        bonusWon: Number(bonusWon) / (10 ** xbtDecimals),
        timestamp: Number(timestamp) * 1000,
        purchasedTokenAmount: Number(purchasedTokenAmount) / (10 ** xbtDecimals),
        totalETHValue: convertToEther(totalETHValue)
    }
}

export const makeBid = async (web3Client, bidRate) => {
    const dealerContract = await getDealerContract(web3Client);
    await dealerContract.methods.exchangeToken().send({
        gas: 240000,
        value: web3Client.utils.toWei(bidRate.toString())
    });
}

export const withdrawFund = async (web3Client) => {
    const dealerContract = await getDealerContract(web3Client);
    await dealerContract.methods.withdrawFund().send({
        gas: 240000,
    });
}

const subscribeEventChange = async (web3Client, eventName, callback) => {
    const dealerContract = await getDealerContract(web3Client);

    const eventJsonInterface = web3Client.utils._.find(
        dealerContract._jsonInterface,
        o => o.name === eventName && o.type === 'event',
    );

    const subscription = web3Client.eth.subscribe('logs', {
        address: MysticDealer.address,
        topics: [eventJsonInterface.signature]
    }, function (error, result) {
        const eventObj = web3Client.eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
        );

        // console.log(`New ${eventName}!`, eventObj)
        if (typeof callback === "function") callback(eventObj);
    });

    return () => subscription.unsubscribe();
}

export const subscribeOrderBookChange = (web3Client, callback) => {
    return subscribeEventChange(web3Client, 'OnSuccessfulSale', callback);
}
