import { ObjectType, Field, ID, Float } from 'type-graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
