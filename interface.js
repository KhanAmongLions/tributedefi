//gtabi
//erc20abi
//lotteryabi

//mainnet

//testnet
//deployall 0x31D094478d55e7273E7cd24045d76562DA057457
svContractAddress="0x878C35126321006C6504eD8C205ffFf0c3c5d5ad"//"0x075DF4071Add26B19308c4b369F121334deb8E74"//"0x89EF2f4C377f06F43731Fdcef0468F2110A7D13b"//"0x207675be975ef31410d3ac6437F1127ffbc49Cde"//"0x7C4Ee32d4bb64a0D7A2b9d9b8021FA5113069d56"//"0x6CDfcC59aE6f230373DB07Af52FbaEe4145F370c"//"0xF77D98E7De0BD0B344cD5544a83ad339fdfB6E91"//"0xB02014f1F4c102a7AcF0d46068490caBe5546b24";//"0xB269491E03813bB4A4b4d4Bdd5e401Ac916DACc9"
tokenContractAddress="0x917235D657Ea632CbA877e671aC9ba749334BA5f"//"0x7cF70cfe54dA4b599417e9C3bbbFCAA2b57D9e11"//"0x10648d3E80E6E718356B55973E7ddA098B4d1869"//"0x7ac65B0d6AB99Bb2211e18D27fC8eB000b8684D7"//"0x9cA665D6c9Db9fD5E41F45Bf648A803AF052D977"//"0x8e9de141842B8A19ac8ef97321199066CC342F6E";//"0x63f2EDceBc167CBDD5f5322d62860B6f915aBFF2"
swapContractAddress="0xb743F29b2B82d713088F36B62957B9c81892DF73"//"0xba587245f74DE1493C54cDc2a5BBBf09b4686Cf1"//"0x64F25FaF290C988D89a61eDD703A6919371F5cE5"//"0xb6ee6eE43d8A5D74fe7a5848BDbE7e7B335E590a"//"0xE32F07eCe279a08F4D05A259707794074E87983e"//"0x17FF6cf2D0D2b45B5c5aa069DCf989cD72E50aDF"
liqTokenAddress="0x6e360dE2F8ae3b69Fea3F61c8f92CF58d5065A43"//"0xc258c7e80E9e441f69fc3d25582c0B577b8df0ba"
lotteryAddress="0xA2dc5fBD3BaC20FEe425d0836a835C312DF92f55"//"0x0693a81BBE1321a8d32A46572d19786D16911206"

liqTokenContract=null
setup()
function setup(){
  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log('interface starting modern')
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */});
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log('legacydapp')
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      alert('please ensure https://metamask.io/ is installed and connected ')
      web3 = new Web3('wss://ropsten.infura.io/ws');
      //web3 = new Web3('wss://mainnet.infura.io/ws');
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    web3.eth.net.getId().then(function(nid){
      window.netId=nid;
			console.log('netid ',window.netId)
    })
		console.log('should be checking network')
    web3.eth.net.getNetworkType().then(function(ntype){
      console.log('network ',ntype)
      //if(ntype!='main'){
      if(ntype!='rinkeby'){
        alert('please switch to rinkeby in Metamask')
        //alert('please switch to mainnet in Metamask')
      }
    })
    window.svContract=new web3.eth.Contract(svAbi,svContractAddress)
		window.tokenContract=new web3.eth.Contract(tokenAbi,tokenContractAddress)
    if(liqTokenAddress){
      window.liqTokenContract=new web3.eth.Contract(liqTokenAbi,liqTokenAddress)
    }

    window.swapContract=new web3.eth.Contract(swapAbi,swapContractAddress)
    window.lotteryContract=new web3.eth.Contract(lotteryAbi,lotteryAddress)
    console.log('calls main now')
		window.main()
  });
}
