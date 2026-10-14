// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialPosts {
    struct Post {
        uint256 id;
        address author;
        string image;
        uint256 timestamp;
        bool isPrivate;
        bool isDeleted;
    }

    // postId => Post
    mapping(uint256 => Post) private posts;
    // author => list of their post IDs
    mapping(address => uint256[]) private userPosts;
    // all post IDs in order
    uint256[] private postIds;
    // auto-increment post counter
    uint256 private nextPostId;

    event PostCreated(uint256 indexed id, address indexed author, string image, uint256 timestamp, bool isPrivate);
    event PostDeleted(uint256 indexed id, address indexed author);
    event PostPrivacyChanged(uint256 indexed id, address indexed author, bool isPrivate);

    constructor() {
        nextPostId = 1; // start IDs from 1
    }

    // Create a new post (with privacy toggle)
    function createPost(string calldata image, bool isPrivate) public returns (uint256) {
        require(bytes(image).length > 0, "Image URL cannot be empty");

        uint256 postId = nextPostId++;
        Post memory newPost = Post({
            id: postId,
            author: msg.sender,
            image: image,
            timestamp: block.timestamp,
            isPrivate: isPrivate,
            isDeleted: false
        });

        posts[postId] = newPost;
        userPosts[msg.sender].push(postId);
        postIds.push(postId);

        emit PostCreated(postId, msg.sender, image, block.timestamp, isPrivate);
        return postId;
    }

    // Overload for backward compatibility
    function createPost(string calldata image) external returns (uint256) {
        return createPost(image, false);
    }

    // Delete a post
    function deletePost(uint256 postId) external {
        require(postId > 0 && postId < nextPostId, "Post does not exist");
        require(posts[postId].author == msg.sender, "Only author can delete");
        require(!posts[postId].isDeleted, "Already deleted");

        posts[postId].isDeleted = true;
        emit PostDeleted(postId, msg.sender);
    }

    // Change privacy of post
    function setPostPrivacy(uint256 postId, bool isPrivate) external {
        require(postId > 0 && postId < nextPostId, "Post does not exist");
        require(posts[postId].author == msg.sender, "Only author can change privacy");
        require(!posts[postId].isDeleted, "Post is deleted");

        posts[postId].isPrivate = isPrivate;
        emit PostPrivacyChanged(postId, msg.sender, isPrivate);
    }

    // Get a single post by ID
    function getPost(uint256 postId) external view returns (Post memory) {
        require(postId > 0 && postId < nextPostId, "Post does not exist");
        return posts[postId];
    }

    // Get all posts made by caller
    function getMyPosts() external view returns (Post[] memory) {
        return getUserPosts(msg.sender);
    }

    // Get posts for a specific user
    function getUserPosts(address user) public view returns (Post[] memory) {
        uint256[] memory ids = userPosts[user];
        Post[] memory userPostList = new Post[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            userPostList[i] = posts[ids[i]];
        }

        return userPostList;
    }

    // Get all posts ever made
    function getAllPosts() external view returns (Post[] memory) {
        uint256 n = postIds.length;
        Post[] memory all = new Post[](n);

        for (uint256 i = 0; i < n; i++) {
            all[i] = posts[postIds[i]];
        }

        return all;
    }

    // Get paginated feed (newest first)
    function getFeed(uint256 offset, uint256 count) external view returns (Post[] memory) {
        uint256 n = postIds.length;
        if (offset >= n) {
            return new Post[](0);
        }

        uint256 available = n - offset;
        if (count > available) {
            count = available;
        }

        Post[] memory feed = new Post[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 index = n - 1 - (offset + i);
            feed[i] = posts[postIds[index]];
        }

        return feed;
    }

    function isPostDeleted(uint256 postId) external view returns (bool) {
        return posts[postId].isDeleted;
    }

    function isPostPrivate(uint256 postId) external view returns (bool) {
        return posts[postId].isPrivate;
    }

    function totalPosts() external view returns (uint256) {
        return postIds.length;
    }

    function totalUserPosts(address user) external view returns (uint256) {
        return userPosts[user].length;
    }
}