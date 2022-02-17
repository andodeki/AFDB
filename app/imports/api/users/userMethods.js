import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

Meteor.methods({
  signUp(username, password, passwordConfirmation) {
    if (password != passwordConfirmation) {
      throw new Meteor.Error(
        "invalid-match",
        "Password and password confirmation must match"
      );
    }
    alreadyExists =
      Meteor.users.find({ username: username }).fetch().length !== 0; //will return true if it finds a user with this username
    if (alreadyExists) {
      throw new Meteor.Error("username-taken", "Username already taken");
    }
    Accounts.createUser({
      username,
      password,
    });
    return true;
  },
});
