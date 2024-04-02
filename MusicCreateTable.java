package samples;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;

import java.util.Arrays;

public class MusicCreateTable {
    public static void main(String[] args) {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
                .withRegion(Regions.US_EAST_1) // Specify the region here
                .build();
        DynamoDB dynamoDB = new DynamoDB(client);
        String tableName = "music_delete";
        int readCapacityUnits = 10;
        int writeCapacityUnits = 10;

        // Convert int values to Long
        Long readCapacityUnitsLong = (long) readCapacityUnits;
        Long writeCapacityUnitsLong = (long) writeCapacityUnits;

        // Create the table
        try {
            System.out.println("Attempting to create table; please wait...");
            Table table = dynamoDB.createTable(tableName,
                    Arrays.asList(
                            new KeySchemaElement("title", "HASH"), // Partition key
                            new KeySchemaElement("artist", "RANGE")), // Sort key
                    Arrays.asList(
                            new AttributeDefinition("title", "S"),
                            new AttributeDefinition("artist", "S")),
                    new ProvisionedThroughput(readCapacityUnitsLong, writeCapacityUnitsLong)); // Use Long values
            table.waitForActive();
            System.out.println("Table created successfully. Status: " + table.getDescription().getTableStatus());
        } catch (Exception e) {
            System.err.println("Unable to create table: ");
            System.err.println(e.getMessage());
            return; // Exit the program if table creation fails
        }

        // If table creation is successful, you can proceed with other operations or exit
    }
}
