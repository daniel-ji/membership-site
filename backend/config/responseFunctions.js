/**
 * Functions for returning responses.
 */

const mongoDeleted = (req, res, next, result, object) => {
    if (result.deletedCount === 0) {
        return res.status(202).json({'info': `No ${object} deleted.`})
    } else {
        return res.status(200).json({'success': `Deleted ${result.deletedCount ?? result.modifiedCount} ${object}.`});
    }
}

const mongoUpdated = (req, res, next, result, object) => {
    if (result.modifiedCount === 0) {
        return res.status(202).json({'info': `No ${object} updated.`})
    } else {
        return res.status(200).json({'success': `Updated ${result.modifiedCount} ${object}.`});
    }
}

module.exports = {mongoDeleted, mongoUpdated}