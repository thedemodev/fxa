import React from 'react';
import EmailBlock from './EmailBlock';
import './index.scss';

export const EmailBlocks = () => {
  return (
    <div className="email-blocks">
      <h2>Find and Delete Email Blocks</h2>
      <p>
        Description TO DO. Tootsie roll macaroon cupcake cake cheesecake pie.
        Chocolate bar bear claw tiramisu dragée icing lemon drops jelly beans
        chocolate toffee. Biscuit danish halvah chupa chups jelly-o. Soufflé
        apple pie lemon drops oat cake chocolate cake jelly beans gingerbread.
      </p>

      <div className="flex">
        <input placeholder="email to search for"></input>
        <button
          className="email-blocks-search-button"
          type="submit"
          title="search"
        ></button>
      </div>

      <hr />

      {/* for each result, .map to: */}

      <EmailBlock />
    </div>
  );
};

export default EmailBlocks;
