const { assert } = require('chai')

const homie = artifacts.require('./homie.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('homie', ([deployer, author, tipper]) => {
  let Homie

  before(async () => {
    Homie = await homie.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await Homie.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await Homie.name()
      assert.equal(name, 'homie')
    })
  })



  describe('video', async () => {
    let result, videoCount
    const hash = 'QmV8cfu6n4NT5xRr2AHdKxFMTZEJrA44qgrBCr739BN9Wb'

    before(async () => {
      result = await Homie.uploadVideo(hash, 'Video Description', { from: author })
      videoCount = await Homie.videoCount()
    })

    //check event
    it('creates videos', async () => {
      // SUCESS
      assert.equal(videoCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), videoCount.toNumber(), 'id is correct')
      assert.equal(event.hashValue, hash, 'Hash is correct')
      assert.equal(event.description, 'Video Description', 'description is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')


      // FAILURE: video must have hash
      await Homie.uploadVideo('', 'Video Description', { from: author }).should.be.rejected;

      // FAILURE: video must have description
      await Homie.uploadVideo('Video Hash', '', { from: author }).should.be.rejected;
    })

    //check from Struct
    it('lists videos', async () => {
      const video = await Homie.Videos(videoCount)
      assert.equal(video.id.toNumber(), videoCount.toNumber(), 'id is correct')
      assert.equal(video.hashValue, hash, 'Hash is correct')
      assert.equal(video.description, 'Video Description', 'description is correct')
      assert.equal(video.tipAmount, '0', 'tip amount is correct')
      assert.equal(video.author, author, 'author is correct')
    })

    it('allows users to tip videos', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await Homie.tipVideoOwner(videoCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), videoCount.toNumber(), 'id is correct')
      assert.equal(event.hashValue, hash, 'Hash is correct')
      assert.equal(event.description, 'Video Description', 'description is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipVideoOwner
      tipVideoOwner = web3.utils.toWei('1', 'Ether')
      tipVideoOwner = new web3.utils.BN(tipVideoOwner)

      const expectedBalance = oldAuthorBalance.add(tipVideoOwner)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      // FAILURE: Tries to tip a video that does not exist
      await Homie.tipVideoOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })
  })
})