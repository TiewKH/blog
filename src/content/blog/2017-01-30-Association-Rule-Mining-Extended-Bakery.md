---
title: "Association Rule Mining on the Extended Bakery dataset"
date: 2017-01-30
description: "Association rule mining exercise conducted on the Extended Bakery dataset. This post includes the motivation of this exercise and the R code to determine which products to sell together based on association rule mining."
---

## Introduction

We used the Extended Bakery Dataset's 75,000 receipt data from `apriori.zip`, which can be found at [this website](https://wiki.csc.calpoly.edu/datasets/wiki/apriori).

We also used `EB-build-goods.sql` to convert the product IDs to their names. The original file can be found [here](https://wiki.csc.calpoly.edu/datasets/wiki/ExtendedBakery75K).

## Objective

### What is the domain and what are the potential benefits to be derived from association rule mining?

The domain of association rule mining is that it is a mining method that specialises in finding frequent patterns, associations, correlations or causal structures in the ExtendedBakery data set that is provided. With associative rule mining we can possible get to **improve the inventory management, customer buying prediction and time related sales**.

Association rules mining or what is sometimes referred to as 'Market Basket Analysis' is among the preeminent component used in data mining to **find useful insights to a particular domain**. It is a **rule-based machine learning method** designed to discover frequent co-occurring associations among a collection of items in transaction and even in relational databases. Normally, data produced in transactions are categorical(non-numeric) data which makes association rules mining a pertinent method because it handles these forms of data well when searching for interesting discoveries.

An association rule has two parts, an antecedent (if) and a consequent (then). An antecedent is an item found in the data. A consequent is an item that is found in combination with the antecedent. **The strength of an association rule can be measured in terms of its support and confidence**. Support is an indication of how frequently the items appear in the database. This is of interest due to the fact that if a rule is measured to be very low in support, it is likely to be uninteresting from a business perspective. For example, it may prove unprofitable to promote items that customers seldom buy together. Confidence, on the other hand indicates the number of times the if/then statements have been found to be true. It essentially measures the reliability of the inference made by a rule.

The classic example of the Beer and Diapers association that is often mentioned in data mining books. The association suggests that a strong relationship exists between the sale of diapers and beer because many customers who buy diapers also buy beer. This can help retailers to learn about purchasing behavior of their customers. Such information can also be utilized to support a variety of business-related applications such as marketing promotions, inventory management, and customer relationship management.

Association mining has been broadly used in many application domains besides the business field in the last years the application areas have increased significantly. Some recent applications are the discovery of patterns in biological databases, extraction of knowledge from software engineering metrics and the optimization of user's profiles for web system personalization. An example would be a case for Walmart in 2004 when a series of hurricanes crossed the state of Florida. Walmart mined their massive retail transaction database to see what their customers really wanted to buy prior to the arrival of a hurricane. They found one particular item that increased in sales by a factor of 7 over normal shopping days. That was a huge Lift factor for a real-world case. That one item was not bottled water, or batteries, or beer, or flashlights, or generators, or any of the usual things that we might imagine. The item was strawberry pop tarts. Therefore, Walmart stocked their stores with tons of strawberry pop tarts prior to the next hurricanes, and they sold them out. That is a win-win: Walmart wins by making the sell, and customers win by getting the product that they most want.

Now that it has been established what association rules are and how it is utilised, we are able to continue on **how would one would be able to apply this to the current Extended Bakery dataset**. The question now comes to, what good may come from the relationships and rules that will be found? Overall, many growth inducing outcomes can occur from the gleaning and utilization of rules. First of all, this would result in the **owners of the business being much more knowledgeable on the subject of their own business**. After pondering this information, one can also form many courses of action based on solid theories backed by proof rather than on simple guesses. The business may increase its sales of specific items of their shop by displaying items with higher correlation together. This should boost the amount of sales of this set, as it increases awareness of the presence of the other item/s in the set. They can also choose sets of items that sell well together to offer as a much more desirable form of promotion, for example set meals and coupon discounts. This option is viable as it would draw more customers into the shop, and thus increase sales and awareness of the shop. In conclusion, **using the association rules may result in higher sales and also increases awareness of the store, both of the potential customers and the owner's**.

<figure class="legacy-frame">
  <iframe src="/legacy/Association-Rule-Mining-Bakery.html" title="Association rule mining output" loading="lazy"></iframe>
  <figcaption>Legacy interactive/output embed. <a href="/legacy/Association-Rule-Mining-Bakery.html">Open full page</a></figcaption>
</figure>

<p>The R Script for the exploratory exercise can be found <a href="/assets/docs/ARM-Extended-Bakery.R" download="ARM-Extended-Bakery.R">here</a>.</p>
