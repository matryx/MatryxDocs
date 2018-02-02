var MatryxPlatform = artifacts.require("MatryxPlatform");
var MatryxTournament = artifacts.require("MatryxTournament");
var MatryxRound = artifacts.require("MatryxRound");

contract('MatryxTournament', function(accounts) {
    var platform;
    var tournament;
    var round;

    it("Created tournament should exist", async function() {

        platform = await MatryxPlatform.deployed();
        // create a tournament.
        createTournamentTransaction = await platform.createTournament("tournament", "external address", 100, 2);

        // get the tournament address
        tournamentAddress = createTournamentTransaction.logs[0].args._tournamentAddress;
        // create tournament from address
        tournament = await MatryxTournament.at(tournamentAddress);

        if(tournament) {
            tournamentExists = true
        } else{
            tournamentExists = false
        }

        assert.equal(tournamentExists, true)
    });

    // There should be no existing submissions
    it("There are no existing submissions", async function() {
        numberOfSubmissions = await tournament.submissionCount()
        assert.equal(numberOfSubmissions, 0)
    });

    it("The tournament is open", async function() {
        await tournament.openTournament();
        // the tournament should be open 
        let tournamentOpen = await tournament.tournamentOpen.call();
        // assert that the tournament is open
        assert.equal(tournamentOpen.valueOf(), true, "The tournament should be open.");
    });

    // Create a Submission
    it("A submission was created", async function() {
        // enter the tournament!
        await platform.enterTournament(tournament.address);
        // create round
        await tournament.createRound(5);

        let roundAddress = await tournament.rounds.call(0);
        round = MatryxRound.at(roundAddress);

        round.Start(0);

        //tournament.startRound(10);
        // create submission
        await tournament.createSubmission("submission1", accounts[0], "external address", ["0x0"], ["0x0"], false);
        // //Check to make sure the submission count is updated
        numberOfSubmissions = await tournament.submissionCount.call();
        assert.equal(numberOfSubmissions, 1, "The number of submissions should equal one.");
    });

    it("There is 1 Submission", async function() {
        numberOfSubmissions = await tournament.submissionCount()
        assert.equal(numberOfSubmissions.valueOf(), 1)
    });

    it("This is the owner", async function() {
        ownerBool = await tournament.isOwner(accounts[0])
        assert.equal(ownerBool, true)
    });

    it("This is NOT the owner", async function() {
        ownerBool = await tournament.isOwner("0x0")
        assert.equal(ownerBool, false)
    });

    it("The Tournament is open", async function() {
        isTournamentOpen = await tournament.tournamentOpen()
        assert.equal(isTournamentOpen, true)
    });

    it("Return the external address", async function() {
        gotExternalAddress = await tournament.getExternalAddress()
        return assert.equal(web3.toAscii(gotExternalAddress).replace(/\u0000/g, ""), "external address");
    });

    it("Return entry fees", async function() {
        getEntryFees = await tournament.getEntryFee()
        assert.equal(getEntryFees, 2)
    });

    // TODO: Update when logic is more fleshed out.
    it("The tournament is closed", async function() {
        await tournament.chooseWinner(0);
        // the tournament should be closed 
        let roundOpen = await round.isOpen();
        // assert that the tournament is closed
        assert.equal(roundOpen.valueOf(), false, "The round should be closed.");
    });

    // it("String is empty", async function() {
    //     let stringEmptyBool = await tournament.stringIsEmpty("");
    //     assert.equal(stringEmptyBool, true, "stringIsEmpty function should say string is empty");
    // });

    // //TODO Migrate platformCode
    // it("Migrate to the new Platform", async function() {
    //     migratedPlatform = await tournament.upgradePlatform("0x1123456789012345678901234567890123456789")
    //     numberOfSubmissions = await tournament.submissionCount()
    //     assert.equal(numberOfSubmissions, 0)
    // });

});