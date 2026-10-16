#ifndef ITEMENTITY_HPP
#define ITEMENTITY_HPP

#include "../world/Block.hpp"

#include <glm/glm.hpp>
#include <vector>

namespace Minecraft {

class World;

struct ItemDropEntity {
    BlockType itemType;
    int count = 1;
    glm::vec3 position;
    glm::vec3 velocity;
    float rotation = 0.0f;
    float pickupDelay = 0.5f;
};

class ItemEntityManager {
public:
    ItemEntityManager();
    ~ItemEntityManager();

    void spawnItemDrop(BlockType type, int count, const glm::vec3& position);
    void update(World& world, const glm::vec3& playerPos, std::vector<std::pair<BlockType, int>>& pickedUpItems,
                float deltaTime);
    const std::vector<ItemDropEntity>& getEntities() const { return m_Items; }
    const std::vector<ItemDropEntity>& getItems() const { return m_Items; }

private:
    std::vector<ItemDropEntity> m_Items;
};

} // namespace Minecraft

#endif // ITEMENTITY_HPP
