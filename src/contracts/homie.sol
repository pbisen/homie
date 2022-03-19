pragma solidity ^0.5.0;

contract homie {
    string public name = "homie";
    uint public videoCount = 0;

    //Store Videos
    mapping(uint256 => Video) public Videos;

    struct Video {
        uint256 id;
        string hashValue; //IPFS Hash of Video
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event VideoCreated(
      uint id,
      string hashValue,
      string description,
      uint tipAmount,
      address payable author
    );

    event VideoTipped(
      uint id,
      string hashValue,
      string description,
      uint tipAmount,
      address payable author
    );

    //Create Videos
    function uploadVideo(string memory _VideoHash, string memory _description) public{
      require(bytes(_description).length > 0, 'Empty Description');
      require(bytes(_VideoHash).length > 0, 'Empty VideoHash');
      require(msg.sender != address(0), 'Empty Address');
      videoCount = videoCount + 1;
      Videos[videoCount] = Video(videoCount, _VideoHash, _description, 0, msg.sender);

      emit VideoCreated(videoCount, _VideoHash, _description, 0, msg.sender);
    }
    //Tip Videos

    function tipVideoOwner(uint _id) public payable{

      require(_id > 0 && _id <= videoCount, 'Invalid Video Chosen for Tipping');
      Video memory _Video = Videos[_id];
      address payable _author = _Video.author;
      address(_author).transfer(msg.value);

      _Video.tipAmount = _Video.tipAmount + msg.value;

      Videos[_id] = _Video;

      emit VideoTipped(_id, _Video.hashValue, _Video.description, _Video.tipAmount, _author);
    }
}
