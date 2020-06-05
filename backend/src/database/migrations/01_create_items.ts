import Knex, { KnexTimeoutError } from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('items', table =>{
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('items')
}