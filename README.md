# Twitter Predictors
No one can predict the future. But some people have a better intuition for the future than others. I want to build a tool that can identify and rank the people with the best prediction track record.

If you can identify those with a better prediction track record, you can then listen to them more closely. You can also do the opposite for those with a worse prediction track record.

There is no algorithm for truth. And human language is imprecise. With current technologies, it is impossible to algorithmically determine the validity of a statement. However, with LLMs it is possible to categorize whether a statement is a prediction or not.

By labeling tweets as predictions or not, the user can judge for themselves and get a better understanding of the accuracy of individuals and groups. 

There are two levels to this tool. The MVP, and the moonshot. The MVP is totally doable with current technology, the moonshot will take serious work to not be a huge money-hole.

## MVP
This is simply a way of browsing predictions. It makes no judgement as to the validity of the predictions.

### Interface
#### Input
- [Optional] Topic
- [Optional] User
- [Optional] Time Frame

#### Output
Display predictions that match the query.


## Moonshot
This builds on the MVP and adds more functionality. It takes as input axioms/assumptions and evaluates all of the predictions against those assumptions. 

Add an additional field to the input. This input should be a statement about reality that should be assumed to be true. E.g.

- Purchasing TSLA prior to 2019 was a good investment.
- The Covid-19 virus caused significant socio-economic disruption.
- Humans have not built AGI as of 2024.

The interface should then mark each prediction based on that assumption.

- "Tesla stock is going to the moon!" - @someuser on 03/12/2018 - Marked as correct
- "Covid-19 will never amount to anything" - @someuser on 01/01/2020 - Marked as incorrect
- "The frontier model firms are BSing, we are not close to AGI" - @someuser on 09/09/2024 - Marked as correct

Each prediction and assumption will be fed to an LLM to determine whether or not the assumption and prediction are in agreement. If they are in disagreement, it is marked as incorrect. If they are in agreement, it is marked as correct. If it is not relevant, it is thrown out.

Once we have the predictions labeled, we can then use that data as we like. Saying things like:

- Who was the most correct?
- Who was the most consistent in their assertions?
- Who made the prediction first?
- What was the percentage of people that were incorrect or correct?

## Implementation
For both the MVP and Moonshot we are simply adding extra fields to tweets using an LLM.
For the MVP, we specify whether or not the tweet is a prediction.
For the moonshot, we specify whether the prediction-tweet agrees with some axiom.

I did a bit of back-of-the-envelope math about how much it would cost to run all of the tweets through an LLM. [Here's the spreadsheet](https://docs.google.com/spreadsheets/d/1qn4xeLueNfpnXzkwkx-J2cEpEcOs-J5LYEia2Pshd48/edit?usp=sharing).
There are some variables in the spreadsheet. Here's my source for those:

- N-tweets - 5.1 mil - stated on [community-archive.org](https://www.community-archive.org)
- Chars / Tweet - 280 - Ignoring longer tweets for simplicity. Using max for estimation purposes.
- Chars / Token - 4 - Got this from a [random reddit comment](https://www.reddit.com/r/ClaudeAI/comments/1bgg5v0/comment/kv7k57d/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button).
- Tokens/Output - 1 - Need only a binary answer for the output, maybe ternary. Prediction/not-prediction. Agree/disagree/unknown.


### MVP
This should be pretty easy to do. Basically, for each Tweet, we feed it into an LLM. We specify the input and output with an instruction like:

>I will give you a short block of text. 
You should tell me whether or not this piece of text is a prediction or not. 
If it is a prediction, output a 1. If it is not, output a 0. 
Reply only with a 1 or a 0. 

According to my calculations, we could pre-process all of the existing Twitter data for somewhere between $60-300 using LLMs. I'm not convinced it has to be this expensive. I think possibly we could use models that are simpler than LLMS for this data and do it for a lot cheaper. Not sure yet though.

### Moonshot
The initial prompt for the axiom/statement pairing could look something like:

>I will give you two statements separated by an empty line. 
Tell me whether or not the two statements agree with each other. 
Do not consider whether or not the statements are actually true, just evaluate whether they
agree with eachother. 
If they agree, output 'agree'. 
If they disagree, output 'disagree'. 
If it is not clear, output 'unknown'. 
Only output those single words. 

This would be prohibitively expensive and slow with the current prices and speeds of LLMs. This is the kind of processing that would need to be done on-the-fly, unlike with the MVP where everything can be pre-processed once. I have absolutely no idea how we could do this.
