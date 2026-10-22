<?php

use humhub\components\Migration;

/**
 * Rebuilds the reaction index for the like table layout in use.
 *
 * Installs that ran the original reaction migration on HumHub 1.18 carry a unique
 * index on object_model/object_id/created_by/reaction_type. HumHub 1.19 drops those
 * columns, which would leave a unique index on created_by/reaction_type and block a
 * user from using the same reaction on a second post. This migration is idempotent
 * and also covers fresh 1.19 installs.
 */
class m261022_000000_sync_reaction_index extends Migration
{
    public function up()
    {
        $schema = $this->db->getTableSchema('{{%like}}', true);
        if ($schema === null || $schema->getColumn('reaction_type') === null) {
            return;
        }

        if ($schema->getColumn('content_addon_record_id') !== null) {
            $this->safeDropIndex('unique-object-user-reaction', '{{%like}}');
            $this->safeDropIndex('idx_unique_user', '{{%like}}');
            $this->safeCreateIndex(
                'idx_unique_user_reaction',
                '{{%like}}',
                ['content_id', 'content_addon_record_id', 'created_by', 'reaction_type'],
                true
            );

            return;
        }

        $this->safeDropIndex('unique-object-user', '{{%like}}');
        $this->safeCreateIndex(
            'unique-object-user-reaction',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by', 'reaction_type'],
            true
        );
    }

    public function down()
    {
        // Index names differ per core version; leaving the reaction-aware index in
        // place is safe, so no rollback is needed.
    }
}
