describe("the auction sniper", () => {
    var auction = new FakeAuctionServer("item-54321");
    var application = new ApplicationRunner();

    after("stop the auction server", () => auction.stop());
    after("stop the application", () => application.stop());

    it("joins an auction until auction closes", () => {
        auction.startSellingItem();
        application.startBiddingIn(auction);
        auction.hasReceivedJoinRequestFromSniper();
        auction.announceClosed();
        application.showsSniperHasLostAuction();
    });
});